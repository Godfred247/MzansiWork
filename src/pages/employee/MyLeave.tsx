import { useState } from 'react';
import { PlaneIcon, PlusIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { LeaveDialog } from '../../components/employee/LeaveDialog';
import { PageHeader } from '../../components/employee/PageHeader';
import { Button } from '../../components/shared/Button';
import { Dialog } from '../../components/shared/Dialog';
import { EmptyState } from '../../components/shared/EmptyState';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { actorId } from '../../utils/selectors';
import { leaveLabels, leaveTypeLabels } from '../../data/statusLabels';
import type { BalanceBasis, LeaveRequest } from '../../types/time';
import { TODAY, fmtDate } from '../../utils/time';

const basisLabel: Record<BalanceBasis, {label: string;tone: 'info' | 'primary' | 'warning';}> = {
  statutory: { label: 'Statutory minimum + policy', tone: 'info' },
  employer: { label: 'Employer benefit', tone: 'primary' },
  verify: { label: 'Awaiting HR verification', tone: 'warning' }
};

export function MyLeave() {
  const { state, dispatch } = useDemo();
  const layout = useEmployeeLayout();
  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState<LeaveRequest | null>(null);
  const mine = state.leave.filter((l) => l.memberId === actorId(state));
  const current = mine.filter((l) => l.status === 'pending' || l.status === 'info_requested' || l.status === 'approved' && l.end >= TODAY);
  const history = mine.filter((l) => !current.includes(l));
  const live = detail ? state.leave.find((l) => l.id === detail.id) ?? detail : null;

  const Row = ({ l }: {l: LeaveRequest;}) =>
  <li>
      <button onClick={() => setDetail(l)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-canvas">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"><PlaneIcon className="h-4 w-4" aria-hidden /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{leaveTypeLabels[l.type]}</span>
          <span className="tnum block text-xs text-muted">{fmtDate(l.start, 'EEE d MMM')}{l.end !== l.start && ` – ${fmtDate(l.end, 'EEE d MMM')}`} · {l.days} day{l.days === 1 ? '' : 's'}</span>
        </span>
        <StatusBadge tone={leaveLabels[l.status].tone} label={leaveLabels[l.status].label} />
      </button>
    </li>;


  return (
    <div className={twMerge('mx-auto max-w-6xl', layout === 'narrow' ? 'space-y-4 p-4' : 'space-y-6 p-8')}>
      <PageHeader title="My Leave" description="Balances and requests. Entitlements are configured by your employer and may be pending HR verification." actions={<Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setFormOpen(true)}>Request leave</Button>} />

      <section aria-labelledby="bal-h">
        <h2 id="bal-h" className="sr-only">Leave balances</h2>
        <ul className={twMerge('grid gap-3', layout === 'narrow' ? 'grid-cols-2' : 'grid-cols-3')}>
          {state.balances.map((b) =>
          <li key={b.type} className="flex flex-col rounded-2xl border border-line bg-surface p-4">
              <p className="text-[13px] font-medium text-ink">{leaveTypeLabels[b.type].replace(' (employer benefit)', '')}</p>
              <p className="tnum mt-2 text-2xl font-semibold text-ink">{b.available === null ? '—' : b.available}<span className="ml-1 text-sm font-normal text-muted">{b.available === null ? '' : 'days left'}</span></p>
              <p className="mt-1 text-xs text-muted">{b.note}</p>
              <div className="mt-auto pt-3"><StatusBadge tone={basisLabel[b.basis].tone} label={basisLabel[b.basis].label} /></div>
            </li>
          )}
        </ul>
      </section>

      <div className={twMerge('grid gap-6', layout === 'wide' && 'grid-cols-2')}>
        <section aria-labelledby="cur-h" className="overflow-hidden rounded-2xl border border-line bg-surface">
          <h2 id="cur-h" className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">Pending & upcoming</h2>
          {current.length === 0 ? <EmptyState icon={PlaneIcon} title="No upcoming leave" body="Requests you submit will appear here with their status." /> : <ul className="divide-y divide-line">{current.map((l) => <Row key={l.id} l={l} />)}</ul>}
        </section>
        <section aria-labelledby="hist-h" className="overflow-hidden rounded-2xl border border-line bg-surface">
          <h2 id="hist-h" className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">Previous requests</h2>
          {history.length === 0 ? <EmptyState icon={PlaneIcon} title="No previous requests" body="Past leave will appear here." /> : <ul className="divide-y divide-line">{history.map((l) => <Row key={l.id} l={l} />)}</ul>}
        </section>
      </div>

      <LeaveDialog open={formOpen} onClose={() => setFormOpen(false)} />

      <Dialog
        open={!!live}
        onClose={() => setDetail(null)}
        title={live ? leaveTypeLabels[live.type] : ''}
        size="sm"
        footer={
        live?.status === 'pending' ?
        <>
              <Button variant="ghost" onClick={() => {dispatch({ type: 'WITHDRAW_LEAVE', id: live.id });setDetail(null);}}>Withdraw request</Button>
              <Button onClick={() => setDetail(null)}>Close</Button>
            </> :
        <Button onClick={() => setDetail(null)}>Close</Button>
        }>
        
        {live &&
        <dl className="divide-y divide-line text-[13px]">
            {[
          ['Status', <StatusBadge key="s" tone={leaveLabels[live.status].tone} label={leaveLabels[live.status].label} />],
          ['Dates', `${fmtDate(live.start)}${live.end !== live.start ? ` – ${fmtDate(live.end)}` : ''}`],
          ['Working days', `${live.days}${live.portion !== 'full' ? ` (${live.portion})` : ''}`],
          ['Submitted', fmtDate(live.submitted)],
          ['Reviewer', live.reviewer ?? 'Pieter van Wyk (pending)'],
          ...(live.decisionReason ? [['Reason', `“${live.decisionReason}”`]] : []),
          ...(live.notes ? [['Your notes', live.notes]] : []),
          ...(live.document ? [['Document', live.document]] : [])].
          map(([k, v], i) =>
          <div key={i} className="flex justify-between gap-4 py-2.5"><dt className="text-muted">{k}</dt><dd className="text-right font-medium text-ink">{v}</dd></div>
          )}
          </dl>
        }
      </Dialog>
    </div>);

}