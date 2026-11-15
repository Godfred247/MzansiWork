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
import { correctionLabels } from '../../../data/statusLabels';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import type { CorrectionKind } from '../../../types/time';
import { mayApprove } from '../../../utils/permissions';
import { memberById, projectName } from '../../../utils/selectors';
import { fmtDate, fmtDur } from '../../../utils/time';

const kindLabel: Record<CorrectionKind, string> = {
  idle_classification: 'Idle classification',
  clock_in: 'Clock-in time',
  clock_out: 'Clock-out time',
  break: 'Break',
  task: 'Task or project'
};

export function CorrectionReview() {
  const { state, dispatch } = useDemo();
  const { id } = useEmployerParams();
  const correction = state.corrections.find((c) => c.id === id);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!correction) {
    return (
      <>
        <MobileHeader title="Correction" />
        <ScreenBody>
          <EmptyState icon={ShieldAlertIcon} title="Request not found" body="This correction is not in your organisation, or it was withdrawn." />
        </ScreenBody>
      </>);
  }

  const member = memberById(state, correction.memberId);
  const allowed = mayApprove(state, correction.memberId, 'approve_corrections');
  const open = correction.status === 'pending' || correction.status === 'submitted' || correction.status === 'info_requested';
  const meta = correctionLabels[correction.status];

  const decide = (decision: 'approved' | 'rejected' | 'info_requested') => {
    if ((decision === 'rejected' || decision === 'info_requested') && reason.trim().length < 8) {
      setError(decision === 'rejected' ? 'Add a reason of at least a few words so the employee understands the decision.' : 'Say what extra information you need.');
      return;
    }
    dispatch({ type: 'REVIEW_CORRECTION', id: correction.id, decision, reason: reason.trim() });
    setError('');
  };

  return (
    <>
      <MobileHeader title="Correction review" subtitle={member?.name} />
      <ScreenBody>
        {!allowed &&
        <Banner tone="danger" title="You cannot decide this request">
            The owner chooses who may approve this person’s timesheet. A manager is not the approver unless they were chosen.
          </Banner>
        }
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted">{fmtDate(correction.date)} · {kindLabel[correction.kind]}</p>
          <StatusBadge tone={meta.tone} label={meta.label} size="md" />
        </div>
        <MSection title="What was recorded">
          <MRow title="Original observation" subtitle={correction.original} chevron={false} />
          <MRow title="Requested change" subtitle={correction.requested} chevron={false} />
          {correction.classification && <MRow title="Classification" subtitle={correction.classification} chevron={false} />}
          {correction.durationSec !== undefined && <MRow title="Duration affected" subtitle={fmtDur(correction.durationSec)} chevron={false} />}
          <MRow title="Project" subtitle={projectName(state, correction.projectId) ?? 'Not linked'} chevron={false} />
          <MRow title="Submitted from" subtitle={correction.source === 'agent' ? 'Windows desktop agent' : 'Employee browser'} chevron={false} />
        </MSection>
        <MSection title="Employee explanation">
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed text-ink">{correction.reason}</p>
            {correction.notes && <p className="mt-2 text-sm text-muted">{correction.notes}</p>}
          </div>
        </MSection>
        <Banner tone="info" title="The original event is kept">
          Approving updates the timesheet. It does not erase the observation, and idle time is not treated as proof that someone was not working.
        </Banner>
        <MSection title="History">
          {correction.history.map((h, i) =>
          <MRow key={`${h.time}-${i}`} title={`${correctionLabels[h.status].label} · ${h.actor}`} subtitle={`${fmtDate(h.date, 'd MMM')} ${h.time}${h.note ? ` — ${h.note}` : ''}`} chevron={false} />
          )}
        </MSection>
        {correction.decisionReason && !open &&
        <MSection title="Decision">
            <MRow title={correction.reviewer ?? 'Reviewer'} subtitle={correction.decisionReason} chevron={false} />
          </MSection>
        }
        {open && allowed &&
        <div className="space-y-3">
            <Field label="Reason" htmlFor="decision-reason" error={error} hint="Required if you reject or ask for more information. Recorded on the audit trail.">
              <TextArea id="decision-reason" value={reason} onChange={(e) => {setReason(e.target.value);setError('');}} placeholder="Why you are approving, rejecting, or asking for more detail" />
            </Field>
            <Button full onClick={() => decide('approved')}>Approve</Button>
            <Button full variant="secondary" onClick={() => decide('info_requested')}>Request more information</Button>
            <Button full variant="danger" onClick={() => decide('rejected')}>Reject</Button>
          </div>
        }
      </ScreenBody>
    </>);
}
