import React, { useEffect, useState } from 'react';
import { CheckIcon, CircleIcon, MailCheckIcon, MailQuestionIcon, PartyPopperIcon, ShieldCheckIcon } from 'lucide-react';
import { Banner } from '../../components/shared/Banner';
import { Button } from '../../components/shared/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { Field } from '../../components/shared/Field';
import { LegalDialog } from '../../components/shared/LegalDialog';
import { Logo } from '../../components/shared/Logo';
import { TextInput } from '../../components/shared/TextInput';
import { ApiError, api, openWorkspace, saveToken } from '../../api/client';
import { useDemo } from '../../contexts/DemoStore';
import { fmtDate } from '../../utils/time';
import type { EmployerScreen } from '../../types/nav';
import { CreateAccount } from '../employer/onboarding/CreateAccount';
import { InviteFirst } from '../employer/onboarding/InviteFirst';
import { OnboardingDone } from '../employer/onboarding/OnboardingDone';
import { OrgDetails } from '../employer/onboarding/OrgDetails';
import { PlanSelect } from '../employer/onboarding/PlanSelect';

function Shell({ children }: {children: React.ReactNode;}) {
  const [doc, setDoc] = useState<'privacy' | 'terms' | null>(null);
  return (
    <div className="scroll-thin relative flex h-full flex-col items-center overflow-y-auto bg-canvas px-5 py-10">
      <Logo size="md" className="mb-8" />
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-card">{children}</div>
      <p className="mt-6 text-center text-xs text-muted">
        <button type="button" onClick={() => setDoc('privacy')} className="underline">Privacy notice</button>
        {' · '}
        <button type="button" onClick={() => setDoc('terms')} className="underline">Terms of service</button>
        {' · '}
        <span className="text-ink">MzansiWork</span>
      </p>
      <LegalDialog doc={doc} onClose={() => setDoc(null)} />
    </div>);

}

export function passwordRules(pw: string) {
  return [
  { ok: pw.length >= 10, label: 'At least 10 characters' },
  { ok: /[A-Za-z]/.test(pw) && /\d/.test(pw), label: 'Letters and at least one number' }];

}

interface InvitationLookup {
  status: 'account' | 'pending' | 'expired' | 'cancelled' | 'none';
  organisationName?: string;
  role?: string;
  department?: string;
  branch?: string;
  expiresAt?: string;
}

function SignIn() {
  const { state, dispatch } = useDemo();
  const [account, setAccount] = useState<'employee' | 'employer'>('employee');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [invite, setInvite] = useState<InvitationLookup | null>(null);
  const employer = account === 'employer';

  const resetEmployee = () => {
    setNeedsPassword(false);
    setInvite(null);
    setPw('');
    setError('');
  };

  const signIn = async (asEmployer: boolean) => {
    const signed = await api<{ token: string; user: { role: string } }>('/api/auth/login', { body: { email: email.trim(), password: pw } });
    if (asEmployer && signed.user.role === 'employee') throw new ApiError('This account is an employee. Choose Employee above.');
    if (!asEmployer && signed.user.role !== 'employee') throw new ApiError('This account runs the organisation. Choose Employer above.');
    saveToken(asEmployer ? 'employer' : 'employee', signed.token);
    const workspace = await openWorkspace(signed.token);
    dispatch({ type: 'ENTER_WORKSPACE', app: asEmployer ? 'employer' : 'employee', workspace });
  };

  const continueEmployee = async () => {
    const address = email.trim();
    if (!/^\S+@\S+\.\S{2,}$/.test(address)) {
      setError('Enter the work email your employer invited.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const found = await api<InvitationLookup>('/api/auth/invitation', { body: { email: address } });
      if (found.status === 'pending') {
        setInvite(found);
        return;
      }
      if (found.status === 'account') {
        setNeedsPassword(true);
        return;
      }
      if (found.status === 'expired') setError('This invitation has expired. Ask your employer to send a new one.');
      else if (found.status === 'cancelled') setError('This invitation was cancelled. Ask your employer to send a new one.');
      else setError('There is no invitation for this email. Ask your employer to invite this address.');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'The invitation could not be checked.');
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employer) {
      if (!pw) return setError('Enter your password.');
      setLoading(true);
      setError('');
      void signIn(true).catch((caught: unknown) => setError(caught instanceof ApiError ? caught.message : 'Sign-in failed.')).finally(() => setLoading(false));
      return;
    }
    if (!needsPassword) {
      void continueEmployee();
      return;
    }
    if (!pw) return setError('Enter your password.');
    setLoading(true);
    setError('');
    void signIn(false).catch((caught: unknown) => setError(caught instanceof ApiError ? caught.message : 'Sign-in failed.')).finally(() => setLoading(false));
  };

  const startSignup = () => {
    const top = state.employerStack[state.employerStack.length - 1]?.name;
    if (!top || top === 'welcome' || top === 'signin' || top === 'forgot' || top === 'dashboard') {
      dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'create' } });
    }
    dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'signup' } });
  };

  if (!employer && invite?.status === 'pending') {
    return <FirstVisit email={email.trim().toLowerCase()} invite={invite} onBack={() => { setInvite(null); setError(''); }} />;
  }

  return (
    <Shell>
      <h1 className="text-lg font-semibold text-ink">Sign in to your workspace</h1>
      <p className="mt-1 text-sm text-muted">{employer ? 'Use the email you registered for your organisation.' : needsPassword ? 'This email already has a password. Sign in with it.' : 'First visit: enter the work email your employer invited. You will create a password next. No email is sent during this demo.'}</p>
      <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
        <fieldset>
          <legend className="text-[13px] font-medium text-ink">I am</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['employee', 'employer'] as const).map((role) =>
            <label key={role} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium ${account === role ? 'border-primary bg-primary-soft text-ink' : 'border-line text-muted'}`}>
              <input type="radio" name="account-role" className="h-4 w-4 accent-primary" checked={account === role} onChange={() => { setAccount(role); resetEmployee(); }} />
              {role === 'employee' ? 'Employee' : 'Employer'}
            </label>
            )}
          </div>
        </fieldset>
        <Field label="Work email" htmlFor="es-email" error={!needsPassword && !employer ? error : ''}>
          <TextInput id="es-email" type="email" autoComplete="email" value={email} invalid={!needsPassword && !employer && !!error} onChange={(e) => { setEmail(e.target.value); resetEmployee(); }} />
        </Field>
        {(employer || needsPassword) &&
        <Field label="Password" htmlFor="es-pw" error={error}>
          <TextInput id="es-pw" type="password" autoComplete="current-password" value={pw} invalid={!!error} onChange={(e) => { setPw(e.target.value); setError(''); }} />
        </Field>
        }
        <Button type="submit" full loading={loading}>{employer ? 'Sign in as employer' : needsPassword ? 'Sign in' : 'Continue'}</Button>
      </form>
      {employer &&
      <Button type="button" full variant="secondary" className="mt-3" onClick={startSignup}>Create an organisation account</Button>
      }
      {(employer || needsPassword) &&
      <button onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'reset' } })} className="mt-4 text-[13px] font-medium text-primary hover:underline">
        Forgot your password?
      </button>
      }
    </Shell>);

}

function FirstVisit({ email, invite, onBack }: { email: string; invite: InvitationLookup; onBack: () => void }) {
  const { dispatch } = useDemo();
  const [setup, setSetup] = useState(false);
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [agree, setAgree] = useState(false);
  const [doc, setDoc] = useState<'privacy' | 'terms' | null>(null);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const rules = passwordRules(pw);
  const team = [invite.department, invite.branch].filter(Boolean).join(' · ');
  const roleLabel = invite.role === 'manager' ? 'Manager' : 'Employee';
  const errors = {
    name: name.trim().length < 2 ? 'Enter your full name.' : '',
    pw: rules.every((rule) => rule.ok) ? '' : 'Password doesn’t meet the requirements.',
    pw2: pw2 !== pw || !pw2 ? 'Passwords don’t match.' : '',
    agree: agree ? '' : 'Please confirm you’ve read the privacy notice.'
  };

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    setError('');
    void (async () => {
      try {
        const accepted = await api<{ token: string }>('/api/auth/accept-invitation', { body: { email, fullName: name.trim(), password: pw } });
        saveToken('employee', accepted.token);
        const workspace = await openWorkspace(accepted.token);
        dispatch({ type: 'ENTER_WORKSPACE', app: 'employee', workspace });
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : 'The invitation could not be accepted.');
      } finally {
        setLoading(false);
      }
    })();
  };

  if (!setup) {
    return (
      <Shell>
        <p className="text-[13px] text-muted">You are invited to join</p>
        <h1 className="mt-1 text-lg font-semibold text-ink">{invite.organisationName}</h1>
        <dl className="mt-4 divide-y divide-line rounded-xl border border-line text-[13px]">
          {[['Email', email], ['Role', roleLabel], ['Team', team || 'Not set'], ['Expires', invite.expiresAt ? fmtDate(invite.expiresAt.slice(0, 10)) : 'In 7 days']].map(([label, value]) =>
          <div key={label} className="flex justify-between gap-3 px-3.5 py-2.5">
            <dt className="text-muted">{label}</dt>
            <dd className="truncate font-medium text-ink">{value}</dd>
          </div>
          )}
        </dl>
        <Banner tone="info" title="Your employer pays for your seat" className="mt-4">
          You won’t be charged. Create a password to clock in, manage leave, and see your own records.
        </Banner>
        <Button full className="mt-5" onClick={() => setSetup(true)}>Create your password</Button>
        <button type="button" onClick={onBack} className="mt-3 w-full text-center text-[13px] font-medium text-primary hover:underline">Use a different email</button>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-lg font-semibold text-ink">Set up your account</h1>
      <p className="mt-1 text-sm text-muted">{email}</p>
      <form className="mt-5 space-y-4" noValidate onSubmit={join}>
        <Field label="Full name" htmlFor="su-name" error={tried ? errors.name : ''}>
          <TextInput id="su-name" value={name} invalid={tried && !!errors.name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Naledi Mahlangu" />
        </Field>
        <Field label="Create password" htmlFor="su-pw" error={tried ? errors.pw : ''}>
          <TextInput id="su-pw" type="password" value={pw} invalid={tried && !!errors.pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
        </Field>
        <ul className="space-y-1 text-xs" aria-label="Password requirements">
          {rules.map((rule) =>
          <li key={rule.label} className={rule.ok ? 'flex items-center gap-1.5 text-success' : 'flex items-center gap-1.5 text-muted'}>
            {rule.ok ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : <CircleIcon className="h-3 w-3" aria-hidden />}
            {rule.label}
          </li>
          )}
        </ul>
        <Field label="Confirm password" htmlFor="su-pw2" error={tried ? errors.pw2 : ''}>
          <TextInput id="su-pw2" type="password" value={pw2} invalid={tried && !!errors.pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
        </Field>
        <label className="flex items-start gap-2.5 text-[13px] text-ink">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line accent-primary" />
          <span>
            I’ve read the{' '}
            <button type="button" className="font-medium text-primary underline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDoc('privacy'); }}>privacy notice</button>
            {' '}and the tracking policy, including what is and isn’t collected.
          </span>
        </label>
        {tried && errors.agree && <p className="text-xs text-danger-dark" role="alert">{errors.agree}</p>}
        {error && <Banner tone="danger" title="Could not join">{error}</Banner>}
        <Button type="submit" full loading={loading}>Join {invite.organisationName || 'the organisation'}</Button>
      </form>
      <button type="button" onClick={() => setSetup(false)} className="mt-3 w-full text-center text-[13px] font-medium text-primary hover:underline">Back</button>
      <LegalDialog doc={doc} onClose={() => setDoc(null)} />
    </Shell>
  );
}

const signupScreens: Partial<Record<EmployerScreen, () => React.ReactElement>> = {
  create: CreateAccount,
  org: OrgDetails,
  plan: PlanSelect,
  'invite-first': InviteFirst,
  done: OnboardingDone
};

export function BrowserSignup() {
  const { state, dispatch } = useDemo();
  const route = state.employerStack[state.employerStack.length - 1];
  useEffect(() => {
    if (state.employerAuthed) return;
    if (!route || route.name === 'welcome' || route.name === 'signin' || route.name === 'forgot') {
      dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'signin' } });
    }
  }, [route, state.employerAuthed, dispatch]);

  if (state.employerAuthed) {
    return (
      <Shell>
        <h1 className="text-lg font-semibold text-ink">You’re signed in as the employer</h1>
        <p className="mt-1 text-sm text-muted">The organisation is open in the employer app. This browser is ready for an employee.</p>
        <Button full className="mt-5" onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'signin' } })}>Employee sign in</Button>
      </Shell>);
  }

  const Screen = route ? signupScreens[route.name] : undefined;
  if (!Screen) return <SignIn />;
  return (
    <div className="flex h-full min-h-0 justify-center bg-canvas">
      <div className="relative flex h-full min-h-0 w-full max-w-md flex-col border-x border-line bg-surface">
        <Screen />
      </div>
    </div>);

}

function Reset() {
  const { dispatch } = useDemo();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  return (
    <Shell>
      {sent ?
      <EmptyState icon={MailCheckIcon} tone="success" title="Check your inbox" body="If an account exists for that email, a reset link valid for 30 minutes has been queued. For your security we don’t confirm whether an account exists." action={<Button variant="secondary" onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'signin' } })}>Back to sign in</Button>} className="py-2" /> :

      <>
          <h1 className="text-lg font-semibold text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-muted">Your employer can’t see or reset your password for you — only you can, via a secure link.</p>
          <form className="mt-5 space-y-4" noValidate onSubmit={(e) => {e.preventDefault();if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');void api('/api/auth/forgot-password', { body: { email } }).finally(() => setSent(true));}}>
            <Field label="Work email" htmlFor="rs-email" error={error}>
              <TextInput id="rs-email" type="email" value={email} invalid={!!error} onChange={(e) => {setEmail(e.target.value);setError('');}} />
            </Field>
            <Button type="submit" full>Send reset link</Button>
          </form>
          <button onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'signin' } })} className="mt-4 text-[13px] font-medium text-primary hover:underline">Back to sign in</button>
        </>
      }
    </Shell>);

}

function Invite() {
  const { state, dispatch } = useDemo();
  const inv = state.invitations.find((i) => i.id === state.lastInviteId);
  if (!inv) {
    return (
      <Shell>
        <EmptyState icon={MailQuestionIcon} title="Waiting for an invitation" body="Send an invitation from the employer app (Employees → Invite). The invitation link will open here, as it would from the email." className="py-2" />
        <button onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'signin' } })} className="mt-2 w-full text-center text-[13px] font-medium text-primary hover:underline">I already have an account</button>
      </Shell>);

  }
  if (inv.status !== 'pending') {
    const msg = inv.status === 'expired' ? 'This invitation has expired' : inv.status === 'cancelled' ? 'This invitation was cancelled' : inv.status === 'accepted' ? 'This invitation was already accepted' : 'This invitation is not valid';
    return (
      <Shell>
        <EmptyState icon={MailQuestionIcon} tone="danger" title={msg} body={`Ask ${inv.invitedBy} at ${state.org.name} to send a new invitation to ${inv.email}.`} className="py-2" />
      </Shell>);

  }
  return (
    <Shell>
      <p className="text-[13px] text-muted">{inv.invitedBy} invited you to join</p>
      <h1 className="mt-1 text-lg font-semibold text-ink">{state.org.name}</h1>
      <dl className="mt-4 divide-y divide-line rounded-xl border border-line text-[13px]">
        {[
        ['Email', inv.email],
        ['Role', 'Employee'],
        ['Team', `${inv.department} · ${inv.branch}`],
        ['Expires', fmtDate(inv.expiresAt)]].
        map(([k, v]) =>
        <div key={k} className="flex justify-between gap-3 px-3.5 py-2.5">
            <dt className="text-muted">{k}</dt>
            <dd className="truncate font-medium text-ink">{v}</dd>
          </div>
        )}
      </dl>
      <Banner tone="info" title="Your employer pays for your seat" className="mt-4">
        You won’t be charged. Joining lets you clock in, manage breaks and leave, and see your own records.
      </Banner>
      <Button full className="mt-5" onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'setup', params: { id: inv.id } } })}>
        Accept invitation
      </Button>
      <p className="mt-3 text-center text-xs text-muted">Not you? Ignore this invitation — it expires automatically.</p>
    </Shell>);

}

function Setup() {
  const { state, dispatch } = useDemo();
  const id = state.employeeRoute.params?.id ?? '';
  const inv = state.invitations.find((i) => i.id === id);
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [agree, setAgree] = useState(false);
  const [doc, setDoc] = useState<'privacy' | 'terms' | null>(null);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const rules = passwordRules(pw);
  const errors = {
    name: name.trim().length < 2 ? 'Enter your full name.' : '',
    pw: rules.every((r) => r.ok) ? '' : 'Password doesn’t meet the requirements.',
    pw2: pw2 !== pw || !pw2 ? 'Passwords don’t match.' : '',
    agree: agree ? '' : 'Please confirm you’ve read the privacy notice and tracking policy.'
  };
  const valid = Object.values(errors).every((e) => !e);

  if (done) {
    return (
      <Shell>
        <EmptyState icon={PartyPopperIcon} tone="success" title={`Welcome, ${name.split(' ')[0]}!`} body={`You’ve joined ${state.org.name}. Your employer now sees your invitation as accepted.`} action={<Button onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'day' } })}>Continue to portal</Button>} className="py-2" />
      </Shell>);

  }
  return (
    <Shell>
      <h1 className="text-lg font-semibold text-ink">Set up your account</h1>
      <p className="mt-1 text-sm text-muted">{inv?.email}</p>
      <form
        className="mt-5 space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTried(true);
          if (!valid || !inv) return;
          setLoading(true);
          setError('');
          void (async () => {
            try {
              const accepted = await api<{ token: string }>('/api/auth/accept-invitation', { body: { email: inv.email, fullName: name.trim(), password: pw } });
              saveToken('employee', accepted.token);
              const workspace = await openWorkspace(accepted.token);
              dispatch({ type: 'ACCEPT_INVITE', id: inv.id, name: name.trim() });
              dispatch({ type: 'ENTER_WORKSPACE', app: 'employee', workspace });
              setDone(true);
            } catch (caught) {
              setError(caught instanceof ApiError ? caught.message : 'The invitation could not be accepted.');
            } finally {
              setLoading(false);
            }
          })();
        }}>
        
        <Field label="Full name" htmlFor="su-name" error={tried ? errors.name : ''}>
          <TextInput id="su-name" value={name} invalid={tried && !!errors.name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Naledi Mahlangu" />
        </Field>
        <Field label="Create password" htmlFor="su-pw" error={tried ? errors.pw : ''}>
          <TextInput id="su-pw" type="password" value={pw} invalid={tried && !!errors.pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
        </Field>
        <ul className="space-y-1 text-xs" aria-label="Password requirements">
          {rules.map((r) =>
          <li key={r.label} className={r.ok ? 'flex items-center gap-1.5 text-success' : 'flex items-center gap-1.5 text-muted'}>
              {r.ok ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : <CircleIcon className="h-3 w-3" aria-hidden />}
              {r.label}
            </li>
          )}
        </ul>
        <Field label="Confirm password" htmlFor="su-pw2" error={tried ? errors.pw2 : ''}>
          <TextInput id="su-pw2" type="password" value={pw2} invalid={tried && !!errors.pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
        </Field>
        <label className="flex items-start gap-2.5 text-[13px] text-ink">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line accent-primary" />
          <span>
            I’ve read the{' '}
            <button type="button" className="font-medium text-primary underline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDoc('privacy'); }}>privacy notice</button>
            {' '}and the <span className="font-medium text-primary">tracking policy</span>, including what is and isn’t collected.
          </span>
        </label>
        {tried && errors.agree && <p className="text-xs text-danger-dark" role="alert">{errors.agree}</p>}
        {error && <Banner tone="danger" title="Could not join">{error}</Banner>}
        <div className="flex items-start gap-2 rounded-lg bg-hover px-3 py-2 text-xs text-muted">
          <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          No keystrokes, screenshots, camera or location are collected.
        </div>
        <Button type="submit" full loading={loading}>Join {state.org.name || 'the organisation'}</Button>
      </form>
      <LegalDialog doc={doc} onClose={() => setDoc(null)} />
    </Shell>);

}

export function EmployeeAuth() {
  const { state } = useDemo();
  const r = state.employeeRoute.name;
  if (r === 'reset') return <Reset />;
  if (r === 'invite') return <Invite />;
  if (r === 'setup') return <Setup />;
  return <SignIn />;
}