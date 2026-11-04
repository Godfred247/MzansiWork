import { BriefcaseIcon, CoffeeIcon, MoonIcon } from 'lucide-react';
import { useDemo } from '../../contexts/DemoStore';
import { breakCategories } from '../../data/projects';
import { correctionLabels, intervalLabels } from '../../data/statusLabels';
import type { Interval } from '../../types/time';
import { projectName, taskName } from '../../utils/selectors';
import { fmtDur, range } from '../../utils/time';
import { Button } from '../shared/Button';
import { StatusBadge } from '../shared/StatusBadge';

interface DayIntervalListProps {
  intervals: Interval[];
  now: number;
  onExplain?: (iv: Interval) => void;
  dense?: boolean;
}

export function DayIntervalList({ intervals, now, onExplain, dense }: DayIntervalListProps) {
  const { state } = useDemo();
  if (!intervals.length) return <p className="py-6 text-center text-sm text-muted">No recorded intervals yet.</p>;
  return (
    <ul className="divide-y divide-line">
      {intervals.map((iv) => {
        const dur = (iv.endSec ?? now) - iv.startSec;
        const correction = iv.correctionId ? state.corrections.find((c) => c.id === iv.correctionId) : undefined;
        const Icon = iv.type === 'work' ? BriefcaseIcon : iv.type === 'break' ? CoffeeIcon : MoonIcon;
        const paid = breakCategories.find((b) => b.id === iv.breakCategory)?.paid;
        const title =
        iv.type === 'work' ?
        [projectName(state, iv.projectId), taskName(state, iv.projectId, iv.taskId)].filter(Boolean).join(' · ') || iv.category || 'Work — no task selected' :
        iv.type === 'break' ?
        iv.breakCategory ?? 'Break' :
        'Idle observation · desktop agent';
        const label = iv.type === 'idle' ? intervalLabels[iv.status] : iv.status === 'approved' ? intervalLabels.approved : { label: 'Observed', tone: 'neutral' as const };
        return (
          <li key={iv.id} className={dense ? 'flex items-start gap-3 py-2.5' : 'flex items-start gap-3 py-3'}>
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iv.type === 'work' ? 'bg-primary-soft text-primary' : iv.type === 'break' ? 'bg-teal-soft text-teal-dark' : 'hatch-warning text-warning'}`}>
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate text-sm font-medium text-ink">{title}</p>
                <StatusBadge tone={label.tone} label={label.label} />
                {iv.type === 'break' && <span className="text-[11px] text-muted">{paid ? 'Paid' : 'Unpaid'} per policy</span>}
              </div>
              <p className="tnum mt-0.5 text-xs text-muted">
                {range(iv.startSec, iv.endSec)} · {fmtDur(dur)}
                {iv.type === 'work' && !iv.endSec && ' · in progress'}
              </p>
              {iv.type === 'idle' && iv.classification && iv.status === 'approved' &&
              <p className="mt-1 text-xs text-success">Approved as work — {iv.classification}. Original observation kept.</p>
              }
              {correction && iv.status !== 'approved' &&
              <p className="mt-1 text-xs text-muted">
                  Your explanation: “{correction.classification ?? correction.requested}” · <span className="font-medium">{correctionLabels[correction.status].label}</span>
                  {correction.decisionReason && ` — “${correction.decisionReason}”`}
                </p>
              }
            </div>
            {onExplain && iv.type === 'idle' && (iv.status === 'unclassified' || iv.status === 'info_requested') && iv.endSec !== undefined &&
            <Button size="sm" variant="secondary" onClick={() => onExplain(iv)}>
                {iv.status === 'info_requested' ? 'Reply' : 'Explain'}
              </Button>
            }
          </li>);

      })}
    </ul>);

}