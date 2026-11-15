import React, { useState } from 'react';
import { CheckIcon, CircleIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { StepProgress } from '../../../components/employer/StepProgress';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { LegalDialog } from '../../../components/shared/LegalDialog';
import { SelectInput } from '../../../components/shared/SelectInput';
import { TextInput } from '../../../components/shared/TextInput';
import { updateSignupDraft } from '../../../api/signupDraft';
import { useDemo } from '../../../contexts/DemoStore';

export function CreateAccount() {
  const { dispatch } = useDemo();
  const [f, setF] = useState({ name: '', email: '', pw: '', pw2: '', org: '', agree: false });
  const [doc, setDoc] = useState<'privacy' | 'terms' | null>(null);
  const [tried, setTried] = useState(false);
  const rules = [
  { ok: f.pw.length >= 10, label: 'At least 10 characters' },
  { ok: /[A-Za-z]/.test(f.pw) && /\d/.test(f.pw), label: 'Letters and a number' }];

  const errs = {
    name: f.name.trim().length < 2 ? 'Enter your full name.' : '',
    email: !/^\S+@\S+\.\S{2,}$/.test(f.email) ? 'Enter a valid work email.' : '',
    pw: rules.every((r) => r.ok) ? '' : 'Password doesn’t meet the requirements.',
    pw2: f.pw2 === f.pw && f.pw2 ? '' : 'Passwords don’t match.',
    org: f.org.trim().length < 2 ? 'Enter your organisation name.' : '',
    agree: f.agree ? '' : 'You need to accept the terms and privacy notice.'
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: k === 'agree' ? e.target.checked : e.target.value });
  const err = (k: keyof typeof errs) => tried ? errs[k] : '';

  return (
    <>
      <MobileHeader title="Create account" />
      <StepProgress step={1} total={4} label="Owner account" />
      <ScreenBody className="bg-surface pt-3">
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (Object.values(errs).some(Boolean)) return;
            updateSignupDraft({ fullName: f.name.trim(), email: f.email.trim().toLowerCase(), password: f.pw, organisationName: f.org.trim() });
            dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'org', params: { orgName: f.org.trim(), ownerName: f.name.trim() } } });
          }}>
          
          <Field label="Full name" htmlFor="ca-name" error={err('name')}><TextInput id="ca-name" value={f.name} invalid={!!err('name')} onChange={set('name')} autoComplete="name" /></Field>
          <Field label="Work email" htmlFor="ca-email" error={err('email')}><TextInput id="ca-email" type="email" value={f.email} invalid={!!err('email')} onChange={set('email')} autoComplete="email" /></Field>
          <Field label="Password" htmlFor="ca-pw" error={err('pw')}><TextInput id="ca-pw" type="password" value={f.pw} invalid={!!err('pw')} onChange={set('pw')} autoComplete="new-password" /></Field>
          <ul className="-mt-2 space-y-1 text-xs">
            {rules.map((r) =>
            <li key={r.label} className={`flex items-center gap-1.5 ${r.ok ? 'text-success' : 'text-muted'}`}>{r.ok ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : <CircleIcon className="h-3 w-3" aria-hidden />}{r.label}</li>
            )}
          </ul>
          <Field label="Confirm password" htmlFor="ca-pw2" error={err('pw2')}><TextInput id="ca-pw2" type="password" value={f.pw2} invalid={!!err('pw2')} onChange={set('pw2')} autoComplete="new-password" /></Field>
          <Field label="Organisation name" htmlFor="ca-org" error={err('org')}><TextInput id="ca-org" value={f.org} invalid={!!err('org')} onChange={set('org')} placeholder="e.g. Mzansi Work (Pty) Ltd" /></Field>
          <Field label="Region" htmlFor="ca-country" hint="Built for Southern Africa. Subscriptions are billed in South African rand."><SelectInput id="ca-country" disabled value="ZA" options={[{ value: 'ZA', label: 'Southern Africa (ZAR)' }]} /></Field>
          <label className="flex items-start gap-2.5 text-[13px] text-ink">
            <input type="checkbox" checked={f.agree} onChange={set('agree')} className="mt-0.5 h-4 w-4 accent-primary" />
            <span>
              I accept the{' '}
              <button type="button" className="font-medium text-primary underline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDoc('terms'); }}>Terms of service</button>
              {' '}and{' '}
              <button type="button" className="font-medium text-primary underline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDoc('privacy'); }}>Privacy notice</button>.
            </span>
          </label>
          {err('agree') && <p role="alert" className="-mt-2 text-xs text-danger-dark">{err('agree')}</p>}
          <Button type="submit" full size="lg">Continue</Button>
        </form>
      </ScreenBody>
      <LegalDialog doc={doc} onClose={() => setDoc(null)} />
    </>);

}