import { useCallback, useState } from 'react';
import { ArrowRightIcon, CheckCircle2Icon, MessageSquareIcon, MoonIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ClockPanel } from '../../components/employee/ClockPanel';
import { CorrectionDialog, type CorrectionTarget } from '../../components/employee/CorrectionDialog';
import { DayIntervalList } from '../../components/employee/DayIntervalList';
import { EndOfDayDialog } from '../../components/employee/EndOfDayDialog';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { TimelineBar } from '../../components/shared/TimelineBar';
import { TimelineLegend } from '../../components/shared/TimelineLegend';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { actorId } from '../../utils/selectors';
import { correctionLabels } from '../../data/statusLabels';
import { dayTotals, intervalsFor } from '../../utils/selectors';
import { TODAY, fmtDate, fmtDur, range } from '../../utils/time';

const pastDays = ['2026-10-23', '2026-10-22', '2026-10-21', '2026-10-20'];

export function MyDay() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const layout = useEmployeeLayout();
  const [summary, setSummary] = useState(false);
  const [target, setTarget] = useState<CorrectionTarget>(null);
  const showSummary = useCallback(() => setSummary(true), []);
  const today = intervalsFor(state, actorId(state), TODAY);
  const unresolved = state.intervals.filter((i) => i.memberId === actorId(state) && i.type === 'idle' && !i.queued && i.endSec !== undefined && (i.status === 'unclassified' || i.status === 'info_requested'));
  const myRequests = state.corrections.filter((c) => c.memberId === actorId(state) && (c.status === 'pending' || c.status === 'info_requested'));
  const greeting = clock < 12 * 3600 ? 'Good morning' : clock < 17 * 3600 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={twMerge('mx-auto max-w-6xl', layout === 'narrow' ? 'space-y-4 p-4' : 'space-y-6 p-8')}>
      <div>
        <p className="text-sm text-muted">{fmtDate(TODAY, 'EEEE d MMMM yyyy')}</p>
        <h1 className={twMerge('font-semibold tracking-tight text-ink', layout === 'narrow' ? 'text-xl' : 'text-2xl')}>{greeting}, Thandi</h1>
      </div>

      <div className={twMerge('grid gap-6', layout === 'wide' && 'grid-cols-[minmax(0,1fr)_320px]')}>
        <div className="min-w-0 space-y-6">
          <ClockPanel onShowSummary={showSummary} />
          <section aria-labelledby="today-h" className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="today-h" className="text-sm font-semibold text-ink">Today’s timeline</h2>
              <TimelineLegend />
            </div>
            <div className="mt-4">
              <TimelineBar intervals={today} now={clock} onSelect={(iv) => iv.type === 'idle' && iv.status === 'unclassified' && iv.endSec !== undefined && setTarget({ mode: 'idle', interval: iv })} />
            </div>
            <div className="mt-3">
              <DayIntervalList intervals={today} now={clock} onExplain={(iv) => setTarget({ mode: 'idle', interval: iv })} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="attn-h" className="rounded-2xl border border-line bg-surface p-5">
            <h2 id="attn-h" className="text-sm font-semibold text-ink">Needs your attention</h2>
            {unresolved.length === 0 && myRequests.length === 0 ?
            <p className="mt-3 flex items-center gap-2 text-sm text-muted"><CheckCircle2Icon className="h-4 w-4 text-success" aria-hidden />You’re all caught up.</p> :

            <ul className="mt-3 space-y-2">
                {unresolved.map((iv) =>
              <li key={iv.id}>
                    <button onClick={() => setTarget({ mode: 'idle', interval: iv })} className="flex w-full items-start gap-3 rounded-xl border border-warning-line bg-warning-soft px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[#FFEDD5]">
                      <MoonIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-ink">{iv.status === 'info_requested' ? 'Manager asked for more info' : 'Interval to review'}</span>
                        <span className="tnum block text-xs text-muted">{fmtDate(iv.date, 'EEE d MMM')} · {range(iv.startSec, iv.endSec)} · {fmtDur((iv.endSec ?? 0) - iv.startSec)}</span>
                      </span>
                      <ArrowRightIcon className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                    </button>
                  </li>
              )}
                {myRequests.map((c) =>
              <li key={c.id} className="flex items-start gap-3 rounded-xl border border-line px-3 py-2.5">
                    <MessageSquareIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">{c.classification ?? c.requested}</span>
                      <span className="block text-xs text-muted">{fmtDate(c.date, 'EEE d MMM')}</span>
                    </span>
                    <StatusBadge tone={correctionLabels[c.status].tone} label={correctionLabels[c.status].label} />
                  </li>
              )}
              </ul>
            }
          </section>

          <section aria-labelledby="recent-h" className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 id="recent-h" className="text-sm font-semibold text-ink">Recent days</h2>
              <button onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'timesheets' } })} className="text-xs font-medium text-primary hover:underline">All timesheets</button>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {pastDays.map((d) => {
                const t = dayTotals(intervalsFor(state, actorId(state), d), clock);
                const st = state.daySubmissions[d];
                return (
                  <li key={d} className="flex items-center justify-between gap-2 py-2.5">
                    <span className="text-[13px] text-ink">{fmtDate(d, 'EEE d MMM')}</span>
                    <span className="flex items-center gap-2">
                      <span className="tnum text-[13px] font-medium text-ink">{fmtDur(t.work)}</span>
                      <StatusBadge tone={st === 'approved' ? 'success' : 'warning'} label={st === 'approved' ? 'Approved' : 'Awaiting review'} />
                    </span>
                  </li>);

              })}
            </ul>
          </section>
        </aside>
      </div>

      <EndOfDayDialog open={summary} onClose={() => setSummary(false)} onExplain={(iv) => setTarget({ mode: 'idle', interval: iv })} />
      <CorrectionDialog target={target} onClose={() => setTarget(null)} />
    </div>);

}