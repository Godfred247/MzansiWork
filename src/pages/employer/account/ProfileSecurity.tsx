import { useState } from 'react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Button } from '../../../components/shared/Button';
import { Dialog } from '../../../components/shared/Dialog';
import { Field } from '../../../components/shared/Field';
import { TextInput } from '../../../components/shared/TextInput';
import { clearToken } from '../../../api/client';
import { useDemo } from '../../../contexts/DemoStore';
import { signedInName, viewerRoleLabel } from '../../../utils/permissions';

export function ProfileSecurity() {
  const { state, dispatch } = useDemo();
  const name = signedInName(state);
  const member = state.members.find((m) => m.id === state.viewerMemberId) ?? state.members.find((m) => m.name === name);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [signOut, setSignOut] = useState(false);

  const save = () => {
    if (current.length < 8) {
      setError('Enter your current password. We never display the stored one.');
      return;
    }
    if (next.length < 10 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) {
      setError('Use at least 10 characters, including a letter and a number.');
      return;
    }
    if (next !== confirm) {
      setError('The new passwords do not match.');
      return;
    }
    setError('');
    setCurrent('');
    setNext('');
    setConfirm('');
    dispatch({ type: 'AUDIT_LOG', category: 'security', action: 'Changed password', target: name, toast: 'Password updated. Other sessions will be asked to sign in again.' });
  };

  return (
    <>
      <MobileHeader title="Profile and security" />
      <ScreenBody>
        <MSection title="Account">
          <MRow title={name} subtitle={`${viewerRoleLabel(state.viewerRole)} · ${state.org.name}`} chevron={false} />
          <MRow title="Work email" subtitle={member?.email || '—'} chevron={false} />
          <MRow title="Department" subtitle={member ? [member.department, member.branch].filter(Boolean).join(' · ') : 'Organisation owner'} chevron={false} />
        </MSection>
        <MSection title="Change password" footer="Managers cannot look up this password. Recovery uses the email reset flow.">
          <div className="space-y-3 p-4">
            <Field label="Current password" htmlFor="cur-pw" error={error}>
              <TextInput id="cur-pw" type="password" autoComplete="current-password" value={current} onChange={(e) => {setCurrent(e.target.value);setError('');}} />
            </Field>
            <Field label="New password" htmlFor="new-pw" hint="At least 10 characters, with a letter and a number.">
              <TextInput id="new-pw" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
            </Field>
            <Field label="Confirm new password" htmlFor="conf-pw">
              <TextInput id="conf-pw" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </Field>
            <Button full onClick={save}>Update password</Button>
          </div>
        </MSection>
        <MSection title="This session">
          <MRow title="Employer app" subtitle="Signed in on this device" chevron={false} />
          <MRow title="Password reset" subtitle="A reset link is emailed. The existing password is never shown." chevron={false} />
        </MSection>
        <Button full variant="secondary" onClick={() => setSignOut(true)}>Sign out</Button>
      </ScreenBody>
      <Dialog
        open={signOut}
        onClose={() => setSignOut(false)}
        title="Sign out?"
        footer={<><Button variant="secondary" onClick={() => setSignOut(false)}>Cancel</Button><Button variant="danger" onClick={() => {clearToken('employer');dispatch({ type: 'EMPLOYER_SIGN_OUT' });}}>Sign out</Button></>}>
        <p className="pb-2 text-sm text-muted">You will return to the welcome screen. Organisation records stay in place.</p>
      </Dialog>
    </>);
}
