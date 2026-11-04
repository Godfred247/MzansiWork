import { useState } from 'react';
import { InboxIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Avatar } from '../../../components/shared/Avatar';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Segmented } from '../../../components/shared/Segmented';
import { Skeleton } from '../../../components/shared/Skeleton';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../contexts/DemoStore';
import { approverScope } from '../../../data/permissions';
import { correctionLabels, leaveLabels, leaveTypeLabels } from '../../../data/statusLabels';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import { useSimulatedLoad } from '../../../hooks/useSimulatedLoad';
import { inScope, viewerRoleLabel } from '../../../utils/permissions';
import { memberById } from '../../../utils/selectors';
import { fmtDate } from '../../../utils/time';

type Tab = 'corrections' | 'leave';

export function Approvals() {
  const { state, dispatch } = useDemo();
  const params = useEmployerParams();
  const [tab, setTab] = useState<Tab>(params.tab === 'leave' ? 'leave' : 'corrections');
  const [scope, setScope] = useState<'open' | 'all'>('open');
  const loading = useSimulatedLoad(400, tab);
  const role = state.viewerRole;

  const corrections = state.corrections.filter((c) => inScope(role, c.memberId));
  const leave = state.leave.filter((l) => inScope(role, l.memberId));
  const openCorrections = corrections.filter((c) => c.status === 'pending' || c.status === 'submitted' || c.status === 'info_requested');
  const openLeave = leave.filter((l) => l.status === 'pending' || l.status === 'info_requested');
  const shownCorrections = scope === 'open' ? openCorrections : corrections;
  const shownLeave = scope === 'open' ? openLeave : leave;

  return (
    <>
      <MobileHeader large title="Approvals" subtitle={role === 'approver' ? `${approverScope.team} · delegated until ${fmtDate(approverScope.until, 'd MMM')}` : viewerRoleLabel(role)} />
      <ScreenBody className="pt-2">
        <Segmented
          full
          label="Inbox"
          value={tab}
          onChange={setTab}
          options={[
          { value: 'corrections', label: 'Corrections', count: openCorrections.length },
          { value: 'leave', label: 'Leave', count: openLeave.length }]
          } />
        <Segmented
          label="Status"
          value={scope}
          onChange={setScope}
          options={[{ value: 'open', label: 'Needs a decision' }, { value: 'all', label: 'All' }]} />

        {loading ?
        <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div> :
        tab === 'corrections' ?
        shownCorrections.length === 0 ?
        <EmptyState icon={InboxIcon} title={scope === 'open' ? 'No corrections waiting' : 'No correction requests'} body="When an employee asks to change a time record, it appears here. Nothing is applied until you decide." /> :
        <MSection title={scope === 'open' ? 'Waiting for review' : 'Correction requests'} footer="Idle time is an observation. Approving a classification does not delete the original event.">
            {shownCorrections.map((c) => {
              const name = memberById(state, c.memberId)?.name ?? 'Employee';
              const meta = correctionLabels[c.status];
              return (
                <MRow
                  key={c.id}
                  leading={<Avatar name={name} size="sm" />}
                  title={name}
                  subtitle={`${fmtDate(c.date, 'd MMM')} · ${c.original}`}
                  trailing={<StatusBadge tone={meta.tone} label={meta.label} />}
                  onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'correction', params: { id: c.id } } })} />);
            })}
          </MSection> :
        shownLeave.length === 0 ?
        <EmptyState icon={InboxIcon} title={scope === 'open' ? 'No leave waiting' : 'No leave requests'} body="Leave requests from people you can approve will show up here." /> :
        <MSection title={scope === 'open' ? 'Waiting for review' : 'Leave requests'}>
            {shownLeave.map((l) => {
              const name = memberById(state, l.memberId)?.name ?? 'Employee';
              const meta = leaveLabels[l.status];
              return (
                <MRow
                  key={l.id}
                  leading={<Avatar name={name} size="sm" />}
                  title={name}
                  subtitle={`${leaveTypeLabels[l.type]} · ${fmtDate(l.start, 'd MMM')}–${fmtDate(l.end, 'd MMM')} · ${l.days} day${l.days === 1 ? '' : 's'}`}
                  trailing={<StatusBadge tone={meta.tone} label={meta.label} />}
                  onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'leave-request', params: { id: l.id } } })} />);
            })}
          </MSection>
        }
      </ScreenBody>
    </>);
}
