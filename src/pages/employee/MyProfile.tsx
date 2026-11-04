import { useState } from 'react';
import { LaptopIcon, LogOutIcon, MonitorIcon, SmartphoneIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { PageHeader } from '../../components/employee/PageHeader';
import { Avatar } from '../../components/shared/Avatar';
import { Button } from '../../components/shared/Button';
import { Field } from '../../components/shared/Field';
import { TextInput } from '../../components/shared/TextInput';
import { Toggle } from '../../components/shared/Toggle';
import { clearToken } from '../../api/client';
import { useDemo } from '../../contexts/DemoStore';
import { actorMember } from '../../utils/selectors';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { passwordRules } from './EmployeeAuth';

const prefs = [
{ id: 'corrections', label: 'Correction and timesheet decisions', email: true },
{ id: 'leave', label: 'Leave decisions and balance changes', email: true },
{ id: 'reminders', label: 'Missing time entries and submission reminders', email: false },
{ id: 'intervals', label: 'Intervals ready to review', email: false }];


export function MyProfile() {
  const { state, dispatch } = useDemo();
  const me = actorMember(state);
  const layout = useEmployeeLayout();
  const [emailPrefs, setEmailPrefs] = useState<Record<string, boolean>>(Object.fromEntries(prefs.map((p) => [p.id, p.email])));
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const rulesOk = passwordRules(pw).every((r) => r.ok);
  const errs = { cur: cur ? '' : 'Enter your current password.', pw: rulesOk ? '' : 'At least 10 characters with letters and a number.', pw2: pw === pw2 && pw2 ? '' : 'Passwords don’t match.' };

  const card = 'rounded-2xl border border-line bg-surface p-5';

  return (
    <div className={twMerge('mx-auto max-w-5xl', layout === 'narrow' ? 'space-y-4 p-4' : 'space-y-6 p-8')}>
      <PageHeader title="My Profile" description="Your details, notifications and security." />
      <div className={twMerge('grid gap-6', layout === 'wide' && 'grid-cols-2')}>
        <section aria-labelledby="det-h" className={card}>
          <div className="flex items-center gap-3">
            <Avatar name={me?.name ?? 'Employee'} size="lg" />
            <div>
              <h2 id="det-h" className="text-base font-semibold text-ink">{me?.name ?? 'Employee'}</h2>
              <p className="text-sm text-muted">{me?.email}</p>
            </div>
          </div>
          <dl className="mt-4 divide-y divide-line text-[13px]">
            {[['Organisation', state.org.name], ['Role', me?.role ?? 'Employee'], ['Department', me ? `${me.department} · ${me.branch}` : ''], ['Working schedule', 'Mon–Fri · 08:00–17:00']].map(([k, v]) =>
            <div key={k} className="flex justify-between gap-3 py-2.5"><dt className="text-muted">{k}</dt><dd className="text-right font-medium text-ink">{v}</dd></div>
            )}
          </dl>
          <p className="mt-2 text-xs text-muted">Employment details are managed by your employer. Contact HR to change them.</p>
        </section>

        <section aria-labelledby="notif-h" className={card}>
          <h2 id="notif-h" className="text-sm font-semibold text-ink">Email notifications</h2>
          <p className="mt-0.5 text-xs text-muted">In-app notifications are always on. Security and policy-change notices are always emailed.</p>
          <div className="mt-4 space-y-4">
            {prefs.map((p) => <Toggle key={p.id} label={p.label} checked={emailPrefs[p.id]} onChange={(v) => setEmailPrefs({ ...emailPrefs, [p.id]: v })} />)}
            <Toggle label="Security and account notices" description="Required — can’t be turned off." checked disabled onChange={() => undefined} />
          </div>
        </section>

        <section aria-labelledby="pw-h" className={card}>
          <h2 id="pw-h" className="text-sm font-semibold text-ink">Change password</h2>
          <p className="mt-0.5 text-xs text-muted">Your employer can never see or retrieve your password.</p>
          <form
            className="mt-4 space-y-3"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              setTried(true);
              if (errs.cur || errs.pw || errs.pw2) return;
              setSaving(true);
              window.setTimeout(() => {
                setSaving(false);
                setCur('');setPw('');setPw2('');setTried(false);
                dispatch({ type: 'TOAST', app: 'employee', message: 'Password updated. Other sessions were signed out.', tone: 'success' });
              }, 700);
            }}>
            
            <Field label="Current password" htmlFor="pf-cur" error={tried ? errs.cur : ''}><TextInput id="pf-cur" type="password" value={cur} invalid={tried && !!errs.cur} onChange={(e) => setCur(e.target.value)} /></Field>
            <Field label="New password" htmlFor="pf-new" error={tried ? errs.pw : ''} hint="At least 10 characters with letters and a number."><TextInput id="pf-new" type="password" value={pw} invalid={tried && !!errs.pw} onChange={(e) => setPw(e.target.value)} /></Field>
            <Field label="Confirm new password" htmlFor="pf-new2" error={tried ? errs.pw2 : ''}><TextInput id="pf-new2" type="password" value={pw2} invalid={tried && !!errs.pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
            <Button type="submit" loading={saving}>Update password</Button>
          </form>
        </section>

        <section aria-labelledby="ses-h" className={card}>
          <h2 id="ses-h" className="text-sm font-semibold text-ink">Active sessions</h2>
          <ul className="mt-3 divide-y divide-line">
            {[
            { icon: LaptopIcon, name: 'Chrome on Windows', meta: 'Cape Town · this browser', current: true },
            { icon: SmartphoneIcon, name: 'Safari on iPhone', meta: 'Cape Town · today 07:59' },
            { icon: MonitorIcon, name: 'MzansiWork desktop agent', meta: state.agent.signedIn ? 'Signed in · v1.4.2' : 'Signed out' }].
            map((s) =>
            <li key={s.name} className="flex items-center gap-3 py-2.5">
                <s.icon className="h-4 w-4 text-muted" aria-hidden />
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-ink">{s.name}</span><span className="block text-xs text-muted">{s.meta}</span></span>
                {s.current && <span className="text-xs font-medium text-success">Current</span>}
              </li>
            )}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'TOAST', app: 'employee', message: 'Signed out of other sessions (simulated).', tone: 'success' })}>Sign out other sessions</Button>
            <Button size="sm" variant="ghost" icon={<LogOutIcon className="h-3.5 w-3.5" />} onClick={() => {clearToken('employee');dispatch({ type: 'EMPLOYEE_SIGN_OUT' });}}>Sign out</Button>
          </div>
        </section>
      </div>
    </div>);

}