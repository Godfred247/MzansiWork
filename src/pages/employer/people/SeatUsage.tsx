import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Avatar } from '../../../components/shared/Avatar';
import { Button } from '../../../components/shared/Button';
import { SeatMeter } from '../../../components/shared/SeatMeter';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../contexts/DemoStore';
import { inviteLabels } from '../../../data/statusLabels';
import { can } from '../../../utils/permissions';
import { getPlan } from '../../../utils/pricing';
import { seatUsage } from '../../../utils/seats';
import { fmtDate } from '../../../utils/time';

export function SeatUsage() {
  const { state, dispatch } = useDemo();
  const usage = seatUsage(state);
  const plan = getPlan(state.subscription.planId);
  const owner = state.members.find((m) => m.role === 'owner');
  const pending = state.invitations.filter((i) => i.status === 'pending');
  const released = state.invitations.filter((i) => i.status === 'expired' || i.status === 'cancelled');

  return (
    <>
      <MobileHeader title="Seat usage" />
      <ScreenBody>
        <MSection title={`${plan.name} · renews ${fmtDate(state.subscription.renewal, 'd MMM yyyy')}`} footer="Available seats = plan user limit − active members − valid pending invitations. The server is the source of truth.">
          <div className="p-4"><SeatMeter usage={usage} /></div>
        </MSection>
        <MSection title="Counted">
          {owner && <MRow leading={<Avatar name={owner.name} size="sm" />} title={owner.name} subtitle="Owner — counts as 1 user" />}
          <MRow title={`${usage.active - 1} other active members`} subtitle="Each occupies 1 seat" onClick={() => dispatch({ type: 'EMPLOYER_TAB', tab: 'employees' })} />
        </MSection>
        <MSection title="Reserved by pending invitations">
          {pending.length === 0 ? <MRow title="No pending invitations" /> : pending.map((i) =>
          <MRow key={i.id} title={i.email} subtitle={`Expires ${fmtDate(i.expiresAt, 'd MMM')}`} trailing={<Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'CANCEL_INVITE', id: i.id })}>Cancel</Button>} />
          )}
        </MSection>
        {released.length > 0 &&
        <MSection title="Released (not counted)">
            {released.map((i) => <MRow key={i.id} title={i.email} trailing={<StatusBadge tone={inviteLabels[i.status].tone} label={inviteLabels[i.status].label} />} />)}
          </MSection>
        }
        {can(state.viewerRole, 'billing') ?
        <Button full variant="secondary" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'compare' } })}>See upgrade options</Button> :

        <p className="text-center text-xs text-muted">Need more seats? Ask the account owner — only they can change the plan.</p>
        }
      </ScreenBody>
    </>);

}