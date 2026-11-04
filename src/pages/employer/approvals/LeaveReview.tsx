import { useState } from 'react';
import { ShieldAlertIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Field } from '../../../components/shared/Field';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { TextArea } from '../../../components/shared/TextArea';
import { useDemo } from '../../../contexts/DemoStore';
import { leaveLabels, leaveTypeLabels } from '../../../data/statusLabels';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import { can, inScope } from '../../../utils/permissions';
import { leaveBreakdown, overlaps } from '../../../utils/leave';
import { memberById } from '../../../utils/selectors';
import { fmtDate } from '../../../utils/time';

const basisLabel = { statutory: 'Statutory minimum (configurable)', employer: 'Employer benefit', verify: 'Awaiting legal or HR verification' };

export function LeaveReview() {
  const { state, dispatch } = useDemo();
  const { id } = useEmployerParams();
  const request = state.leave.find((l) => l.id === id);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!request) {
    return (
      <>
        <MobileHeader title="Leave request" />
        <ScreenBody>
          <EmptyState icon={ShieldAlertIcon} title="Request not found" body="This leave request is not available to your account." />
        </ScreenBody>
      </>);
  }

  const member = memberById(state, request.memberId);
  const allowed = can(state.viewerRole, 'approve_leave') && inScope(state.viewerRole, request.memberId);
  const open = request.status === 'pending' || request.status === 'info_requested';
  const meta = leaveLabels[request.status];
  const breakdown = leaveBreakdown(request.start, request.end, request.portion);
  const balance = state.balances.find((b) => b.type === request.type);
  const overlapsWith = state.leave.filter((l) => l.id !== request.id && l.status !== 'rejected' && l.status !== 'withdrawn' && overlaps(l, request));
  const sameTeam = overlapsWith.filter((l) => memberById(state, l.memberId)?.department === member?.department);

  const decide = (decision: 'approved' | 'rejected' | 'info_requested') => {
    if ((decision === 'rejected' || decision === 'info_requested') && reason.trim().length < 8) {
      setError(decision === 'rejected' ? 'Give a reason the employee can read.' : 'Say what you still need before you can decide.');
      return;
    }
    dispatch({ type: 'REVIEW_LEAVE', id: request.id, decision, reason: reason.trim() });
    setError('');
  };

  return (
    <>
      <MobileHeader title="Leave request" subtitle={member?.name} />
      <ScreenBody>
        {!allowed &&
        <Banner tone="danger" title="You cannot decide this request">
            Leave decisions follow the same permission scope as other approvals.
          </Banner>
        }
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted">Submitted {fmtDate(request.submitted, 'd MMM yyyy')}</p>
          <StatusBadge tone={meta.tone} label={meta.label} size="md" />
        </div>
        <MSection title="Request">
          <MRow title={leaveTypeLabels[request.type]} subtitle={member ? `${member.department} · ${member.branch}` : undefined} chevron={false} />
          <MRow title={`${fmtDate(request.start, 'EEE d MMM')} – ${fmtDate(request.end, 'EEE d MMM yyyy')}`} subtitle={`${request.days} working day${request.days === 1 ? '' : 's'} · ${request.portion === 'full' ? 'Full days' : request.portion === 'morning' ? 'Morning only' : 'Afternoon only'}`} chevron={false} />
          {request.notes && <MRow title="Notes" subtitle={request.notes} chevron={false} />}
          <MRow title="Supporting document" subtitle={request.document ?? 'None attached'} chevron={false} />
          <MRow title="Contact during leave" subtitle={request.contact ?? 'Not requested by policy'} chevron={false} />
        </MSection>
        {breakdown &&
        <MSection title="Duration check" footer="Weekends and configured public holidays are not counted as working days.">
            <MRow title="Working days requested" subtitle={`${breakdown.working}`} chevron={false} />
            <MRow title="Weekends in range" subtitle={`${breakdown.weekends}`} chevron={false} />
            <MRow title="Public holidays" subtitle={breakdown.holidays.length ? breakdown.holidays.map((h) => h.name).join(', ') : 'None in this range'} chevron={false} />
          </MSection>
        }
        <MSection title="Balance reference" footer="Balances are configured per policy. They are not a legal determination, and not every employee qualifies for every leave type.">
          {balance ?
          <>
              <MRow title={balance.available === null ? 'No numeric balance' : `${balance.available} days available`} subtitle={`${basisLabel[balance.basis]}. Used in cycle: ${balance.used}.`} chevron={false} />
              <div className="px-4 py-3 text-xs leading-relaxed text-muted">{balance.note}</div>
            </> :
          <MRow title="No balance configured for this type" subtitle="Set the entitlement in organisation policy before treating this as payable leave." chevron={false} />
          }
        </MSection>
        <MSection title="Overlapping leave">
          {overlapsWith.length === 0 ?
          <MRow title="No overlapping requests" subtitle="Nobody else has pending or approved leave on these dates." chevron={false} /> :
          overlapsWith.map((l) =>
          <MRow
            key={l.id}
            title={memberById(state, l.memberId)?.name ?? 'Employee'}
            subtitle={`${leaveTypeLabels[l.type]} · ${fmtDate(l.start, 'd MMM')}–${fmtDate(l.end, 'd MMM')}`}
            trailing={<StatusBadge tone={leaveLabels[l.status].tone} label={leaveLabels[l.status].label} />}
            chevron={false} />
          )}
          {sameTeam.length > 0 && <div className="px-4 py-3 text-xs text-warning">{sameTeam.length} in the same department. Check staffing before you approve.</div>}
        </MSection>
        {request.decisionReason &&
        <MSection title="Decision">
            <MRow title={request.reviewer ?? 'Reviewer'} subtitle={request.decisionReason} chevron={false} />
          </MSection>
        }
        {open && allowed &&
        <div className="space-y-3">
            <Field label="Reason" htmlFor="leave-reason" error={error} hint="Required when you reject or ask for more information.">
              <TextArea id="leave-reason" value={reason} onChange={(e) => {setReason(e.target.value);setError('');}} placeholder="What the employee should know about this decision" />
            </Field>
            <Button full onClick={() => decide('approved')}>Approve leave</Button>
            <Button full variant="secondary" onClick={() => decide('info_requested')}>Request more information</Button>
            <Button full variant="danger" onClick={() => decide('rejected')}>Reject</Button>
          </div>
        }
      </ScreenBody>
    </>);
}
