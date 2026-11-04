import { useState } from 'react';
import { BanIcon, MailCheckIcon } from 'lucide-react';
import { AccessDenied } from '../../../components/shared/AccessDenied';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Field } from '../../../components/shared/Field';
import { SeatMeter } from '../../../components/shared/SeatMeter';
import { SelectInput } from '../../../components/shared/SelectInput';
import { Sheet } from '../../../components/shared/Sheet';
import { TextInput } from '../../../components/shared/TextInput';
import { useDemo } from '../../../contexts/DemoStore';
import { invitationEmail, type EmailTemplate } from '../../../data/emails';
import { departments } from '../../../data/members';
import type { Branch, Role } from '../../../types/org';
import { can, viewerRoleLabel } from '../../../utils/permissions';
import { fmtZAR, getPlan, priceFor } from '../../../utils/pricing';
import { checkInvite, seatUsage } from '../../../utils/seats';

export function InviteEmployee() {
  const { state, dispatch } = useDemo();
  const role = state.viewerRole;
  const [email, setEmail] = useState('');
  const [memberRole, setMemberRole] = useState<Role>('employee');
  const [dept, setDept] = useState('Design');
  const [branch, setBranch] = useState<Branch>('Cape Town');
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sent, setSent] = useState<EmailTemplate | null>(null);
  const usage = seatUsage(state);
  const plan = getPlan(state.subscription.planId);

  if (!can(role, 'invite')) {
    return (
      <>
        <MobileHeader title="Invite employee" />
        <ScreenBody><AccessDenied title="You can’t invite employees" body="Your role doesn’t include invitation rights. Ask the owner or a manager." role={viewerRoleLabel(role)} /></ScreenBody>
      </>);

  }

  const check = () => {
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      const r = checkInvite(email, state);
      if (r.ok) return setConfirm(true);
      if (r.reason === 'no_seats') {
        setBlocked(true);
        dispatch({ type: 'INVITE_BLOCKED', email: email.trim() });
        return;
      }
      setError(r.message);
    }, 450);
  };

  if (sent) {
    return (
      <>
        <MobileHeader title="Invitation sent" />
        <ScreenBody>
          <EmptyState icon={MailCheckIcon} tone="success" title="Invitation queued" body={`${email.trim().toLowerCase()} has 7 days to accept. 1 seat is reserved until then.`} action={
          <div className="flex flex-col gap-2">
              <Button onClick={() => {setSent(null);setEmail('');}}>Invite another</Button>
              <Button variant="secondary" onClick={() => dispatch({ type: 'EMPLOYER_BACK' })}>Done</Button>
            </div>
          } />
          <MSection title="Email queued for SendGrid" footer="The browser does not contact a mailbox. The API stores this message and hands it to SendGrid when an API key is configured.">
            <pre className="whitespace-pre-wrap px-4 py-3 text-xs leading-relaxed text-ink">{sent.subject}{'\n\n'}{sent.body}</pre>
          </MSection>
        </ScreenBody>
      </>);

  }

  return (
    <>
      <MobileHeader title="Invite employee" />
      <ScreenBody>
        <MSection title={`${plan.name} plan · seats`}>
          <div className="p-4"><SeatMeter usage={usage} /></div>
        </MSection>

        {blocked ?
        <div className="space-y-4">
            <Banner tone="danger" icon={BanIcon} title="No seats available — invitation not sent">
              Your {plan.name} plan includes {usage.limit} users (you count as one). {usage.active} are active and {usage.reserved} {usage.reserved === 1 ? 'seat is' : 'seats are'} reserved by pending invitations. Nothing was sent and nothing was charged.
            </Banner>
            <MSection title="Your options">
              <div className="space-y-2 p-4 text-[13px] text-ink">
                <p>• Cancel a pending invitation to release its seat.</p>
                <p>• Deactivate someone who has left.</p>
                <p>• Compare plans — changes only happen after you confirm the new price.</p>
              </div>
            </MSection>
            {can(role, 'billing') ?
          <Button full size="lg" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'compare', params: { from: 'invite' } } })}>Compare plans</Button> :

          <Banner tone="info" title="Ask the account owner">Only the owner can change the plan. Current plan: {plan.name} · {fmtZAR(priceFor(state.subscription.planId, state.subscription.frequency))}.</Banner>
          }
            <Button full variant="secondary" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'employees' } })}>Manage invitations</Button>
            <Button full variant="ghost" onClick={() => dispatch({ type: 'EMPLOYER_BACK' })}>Cancel</Button>
          </div> :

        <form className="space-y-4" noValidate onSubmit={(e) => {e.preventDefault();check();}}>
            <Field label="Work email" htmlFor="iv-email" error={error}>
              <TextInput id="iv-email" type="email" value={email} invalid={!!error} onChange={(e) => {setEmail(e.target.value);setError('');}} placeholder="name@karoodigital.co.za" autoComplete="off" />
            </Field>
            <Field label="Role" htmlFor="iv-role" hint="No role includes billing access.">
              <SelectInput id="iv-role" value={memberRole} onChange={(e) => setMemberRole(e.target.value as Role)} options={role === 'owner' ? [{ value: 'employee', label: 'Employee' }, { value: 'manager', label: 'Manager' }] : [{ value: 'employee', label: 'Employee' }]} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Department" htmlFor="iv-dept"><SelectInput id="iv-dept" value={dept} onChange={(e) => setDept(e.target.value)} options={departments.map((d) => ({ value: d, label: d }))} /></Field>
              <Field label="Branch" htmlFor="iv-branch"><SelectInput id="iv-branch" value={branch} onChange={(e) => setBranch(e.target.value as Branch)} options={[{ value: 'Cape Town', label: 'Cape Town' }, { value: 'Johannesburg', label: 'Johannesburg' }]} /></Field>
            </div>
            <Button type="submit" full size="lg" loading={checking}>Check seats & continue</Button>
            <p className="text-center text-xs text-muted">We check seat availability, existing members and duplicate invitations first.</p>
          </form>
        }
      </ScreenBody>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Send invitation?" description="This reserves 1 seat until the invitation is accepted, cancelled or expires (7 days)." footer={
      <div className="flex gap-2">
          <Button full variant="secondary" onClick={() => setConfirm(false)}>Back</Button>
          <Button full onClick={() => {dispatch({ type: 'SEND_INVITE', email, role: memberRole, department: dept, branch });setConfirm(false);setSent(invitationEmail(email.trim().toLowerCase(), memberRole === 'manager' ? 'manager' : 'employee', `${dept} · ${branch}`));}}>Send invitation</Button>
        </div>
      }>
        <dl className="divide-y divide-line text-[13px]">
          {[['Email', email], ['Role', memberRole === 'manager' ? 'Manager' : 'Employee'], ['Team', `${dept} · ${branch}`], ['Seats after sending', `${usage.available - 1} available`]].map(([k, v]) =>
          <div key={k} className="flex justify-between gap-3 py-2.5"><dt className="text-muted">{k}</dt><dd className="tnum truncate font-medium text-ink">{v}</dd></div>
          )}
        </dl>
      </Sheet>
    </>);

}