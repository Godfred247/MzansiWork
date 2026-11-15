import { useState } from 'react';
import { addDays, format, getDay, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, PencilLineIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { CorrectionDialog, type CorrectionTarget } from '../../components/employee/CorrectionDialog';
import { DayIntervalList } from '../../components/employee/DayIntervalList';
import { PageHeader } from '../../components/employee/PageHeader';
import { Button } from '../../components/shared/Button';
import { Segmented } from '../../components/shared/Segmented';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { TimelineBar } from '../../components/shared/TimelineBar';
import { TimelineLegend } from '../../components/shared/TimelineLegend';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { correctionLabels } from '../../data/statusLabels';
import type { Tone } from '../../types/org';
import { actorId, currentWorkDate, dayTotals, intervalsFor } from '../../utils/selectors';
import { fmtDate, fmtDur, fmtHours, secToLabel } from '../../utils/time';

type View = 'day' | 'week' | 'month';

export function MyTimesheets() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const layout = useEmployeeLayout();
  const [view, setView] = useState<View>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const today = currentWorkDate(state);
  const [date, setDate] = useState(today);
  const [target, setTarget] = useState<CorrectionTarget>(null);
  const weekStart = startOfWeek(addDays(parseISO(today), weekOffset * 7), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => format(addDays(weekStart, index), 'yyyy-MM-dd'));
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = format(weekStart, 'yyyy') === format(weekEnd, 'yyyy')
    ? format(weekStart, 'MMM yyyy') === format(weekEnd, 'MMM yyyy')
      ? `${format(weekStart, 'd')}–${format(weekEnd, 'd MMM yyyy')}`
      : `${format(weekStart, 'd MMM')}–${format(weekEnd, 'd MMM yyyy')}`
    : `${format(weekStart, 'd MMM yyyy')}–${format(weekEnd, 'd MMM yyyy')}`;

  const dayStatus = (d: string): {label: string;tone: Tone;} => {
    const st = state.daySubmissions[d];
    const corrected = state.corrections.some((c) => c.memberId === actorId(state) && c.date === d && c.status === 'approved');
    if (st === 'approved') return corrected ? { label: 'Approved · corrected', tone: 'success' } : { label: 'Approved', tone: 'success' };
    if (st === 'submitted') return { label: 'Awaiting review', tone: 'warning' };
    if (st === 'open') return { label: 'Open', tone: 'neutral' };
    return { label: 'Not scheduled', tone: 'neutral' };
  };

  const openDay = (d: string) => {
    setDate(d);
    setView('day');
  };

  const rows = weekDays.map((d) => {
    const t = dayTotals(intervalsFor(state, actorId(state), d), clock);
    const weekday = getDay(parseISO(d));
    const weekend = weekday === 0 || weekday === 6;
    return { d, t, weekend, future: d > today };
  });
  const totalWork = rows.reduce((a, r) => a + r.t.work, 0);
  const approved = rows.filter((r) => state.daySubmissions[r.d] === 'approved').reduce((a, r) => a + r.t.approvedEstimate, 0);
  const pending = totalWork - approved;

  return (
    <div className={twMerge('mx-auto max-w-6xl', layout === 'narrow' ? 'space-y-4 p-4' : 'space-y-6 p-8')}>
      <PageHeader
        title="My Timesheets"
        description="Original records, your explanations and approved results — always shown separately."
        actions={
        <>
            <Button variant="secondary" size="sm" icon={<DownloadIcon className="h-3.5 w-3.5" />} onClick={() => dispatch({ type: 'TOAST', app: 'employee', message: 'Your records export is ready (simulated CSV — own records only).', tone: 'success' })}>
              Export my records
            </Button>
            <Button size="sm" icon={<PencilLineIcon className="h-3.5 w-3.5" />} onClick={() => {const t = dayTotals(intervalsFor(state, actorId(state), date), clock);setTarget({ mode: 'general', date, firstStart: t.firstStart, lastEnd: t.lastEnd });}}>
              Request correction
            </Button>
          </>
        } />
      

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Timesheet view" value={view} onChange={setView} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
        {view === 'week' &&
        <div className="flex items-center gap-1">
            <button aria-label="Previous week" onClick={() => setWeekOffset((offset) => offset - 1)} className="rounded-md p-1.5 text-muted hover:bg-hover"><ChevronLeftIcon className="h-4 w-4" /></button>
            <span className="tnum min-w-[150px] text-center text-sm font-medium text-ink">{weekLabel}</span>
            <button aria-label="Next week" disabled={weekOffset === 0} onClick={() => setWeekOffset((offset) => Math.min(0, offset + 1))} className="rounded-md p-1.5 text-muted hover:bg-hover disabled:opacity-30"><ChevronRightIcon className="h-4 w-4" /></button>
          </div>
        }
        {view === 'day' &&
        <select aria-label="Choose day" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 rounded-lg border border-line bg-surface px-3 text-sm">
            {weekDays.filter((day) => day <= today).reverse().map((day) => <option key={day} value={day}>{fmtDate(day)}</option>)}
          </select>
        }
      </div>

      {view === 'week' &&
      <>
          <dl className="grid grid-cols-3 gap-3">
            {[['Recorded work', fmtDur(totalWork)], ['Approved', fmtDur(approved)], ['Awaiting review / open', fmtDur(pending)]].map(([k, v], i) =>
          <div key={k} className={twMerge('rounded-xl border bg-surface px-4 py-3', i === 1 ? 'border-success-line' : 'border-line')}>
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="tnum mt-1 text-xl font-semibold text-ink">{v}</dd>
              </div>
          )}
          </dl>
          {layout === 'narrow' ?
        <ul className="space-y-2">
              {rows.filter((r) => !r.weekend).map(({ d, t, future }) => {
            const st = dayStatus(d);
            return (
              <li key={d}>
                    <button disabled={future} onClick={() => openDay(d)} className="w-full rounded-xl border border-line bg-surface p-3.5 text-left disabled:opacity-50">
                      <div className="flex items-center justify-between"><span className="text-sm font-medium text-ink">{fmtDate(d, 'EEE d MMM')}</span>{!future && <StatusBadge tone={st.tone} label={st.label} />}</div>
                      {!future && <p className="tnum mt-1 text-xs text-muted">{t.firstStart !== undefined ? `${secToLabel(t.firstStart)}–${secToLabel(t.lastEnd ?? clock)}` : '—'} · Work {fmtDur(t.work)} · Breaks {fmtDur(t.breaks)}</p>}
                    </button>
                  </li>);

          })}
            </ul> :

        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <table className="w-full text-left text-[13px]">
                <caption className="sr-only">Weekly timesheet</caption>
                <thead className="border-b border-line bg-canvas text-xs text-muted">
                  <tr>
                    {['Day', 'Scheduled', 'Attendance', 'Work', 'Breaks', 'Idle observed', 'Approved', 'Status'].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map(({ d, t, weekend, future }) => {
                const st = dayStatus(d);
                const dim = weekend || future;
                return (
                  <tr key={d} onClick={() => !dim && openDay(d)} className={twMerge('tnum', dim ? 'text-subtle' : 'cursor-pointer hover:bg-canvas')}>
                        <td className="px-4 py-3 font-medium text-ink">{fmtDate(d, 'EEE d MMM')}</td>
                        <td className="px-4 py-3">{weekend ? '—' : '08:00–17:00'}</td>
                        <td className="px-4 py-3">{t.firstStart !== undefined ? `${secToLabel(t.firstStart)}–${t.lastEnd && d !== today ? secToLabel(t.lastEnd) : state.session.state === 'ended' ? secToLabel(t.lastEnd ?? clock) : 'now'}` : '—'}</td>
                        <td className="px-4 py-3">{t.work ? fmtHours(t.work) : '—'}</td>
                        <td className="px-4 py-3">{t.breaks ? fmtDur(t.breaks) : '—'}</td>
                        <td className="px-4 py-3">
                          {t.idleCount ?
                      <span className={t.unresolvedCount ? 'text-warning' : ''}>{t.idleCount} · {t.unresolvedCount ? `${t.unresolvedCount} unexplained` : 'explained'}</span> :
                      '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-ink">{state.daySubmissions[d] === 'approved' ? fmtHours(t.approvedEstimate) : dim ? '—' : <span className="font-normal text-muted">Pending</span>}</td>
                        <td className="px-4 py-3">{!dim && <StatusBadge tone={st.tone} label={st.label} />}</td>
                      </tr>);

              })}
                </tbody>
              </table>
            </div>
        }
        </>
      }

      {view === 'month' && <MonthGrid today={today} onOpen={openDay} dayStatus={dayStatus} />}

      {view === 'day' && <DayDetail date={date} onExplain={(iv) => setTarget({ mode: 'idle', interval: iv })} />}

      <CorrectionDialog target={target} onClose={() => setTarget(null)} />
    </div>);

}

function MonthGrid({ today, onOpen, dayStatus }: {today: string;onOpen: (d: string) => void;dayStatus: (d: string) => {label: string;tone: Tone;};}) {
  const { state } = useDemo();
  const clock = useClock();
  const firstDay = startOfMonth(parseISO(today));
  const monthLength = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate();
  const leadingDays = (getDay(firstDay) + 6) % 7;
  const cells: (string | null)[] = [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from({ length: monthLength }, (_, index) => format(addDays(firstDay, index), 'yyyy-MM-dd'))
  ];
  const monthHasData = cells.some((day) => day !== null && intervalsFor(state, actorId(state), day, false).length > 0);
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-ink">{format(firstDay, 'MMMM yyyy')}</h2>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="py-1 font-medium">{day}</div>)}
        {cells.map((day, index) => {
          if (!day) return <div key={`e${index}`} />;
          const intervals = intervalsFor(state, actorId(state), day, false);
          const hasData = intervals.length > 0;
          const totals = hasData ? dayTotals(intervals, clock) : null;
          const status = hasData ? dayStatus(day) : null;
          const weekend = index % 7 === 5 || index % 7 === 6;
          const clickable = hasData && day <= today;
          return (
            <button
              key={day}
              disabled={!clickable}
              onClick={() => onOpen(day)}
              className={twMerge('flex min-h-[64px] flex-col items-start rounded-lg border p-1.5 text-left', day === today ? 'border-primary' : 'border-line', weekend && 'bg-canvas', clickable && 'hover:bg-hover')}>
              <span className="tnum text-[11px] font-medium text-ink">{Number(day.slice(-2))}</span>
              {totals && <span className="tnum mt-auto text-[11px] text-ink">{(totals.work / 3600).toFixed(1)} h</span>}
              {status && <span className={twMerge('text-[10px]', status.tone === 'success' ? 'text-success' : status.tone === 'warning' ? 'text-warning' : 'text-muted')}>{status.label}</span>}
            </button>);
        })}
      </div>
      {!monthHasData && <p className="mt-4 text-center text-sm text-muted">No time records have been added this month.</p>}
    </div>);

}
function DayDetail({ date, onExplain }: {date: string;onExplain: Parameters<typeof DayIntervalList>[0]['onExplain'];}) {
  const { state } = useDemo();
  const clock = useClock();
  const ivs = intervalsFor(state, actorId(state), date);
  const t = dayTotals(ivs, clock);
  const events = state.events.filter((e) => e.date === date && e.memberId === actorId(state)).sort((a, b) => a.sec - b.sec);
  const corrections = state.corrections.filter((c) => c.memberId === actorId(state) && c.date === date);
  const st = state.daySubmissions[date];

  return (
    <div className="space-y-5">
      <section aria-labelledby="obs-h" className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="obs-h" className="flex items-center gap-2 text-sm font-semibold text-ink">1 · Observed <span className="font-normal text-muted">original records, never edited</span></h2>
          <TimelineLegend />
        </div>
        <div className="mt-4"><TimelineBar intervals={ivs} now={clock} /></div>
        <DayIntervalList intervals={ivs} now={clock} onExplain={onExplain} />
        {events.length > 0 &&
        <details className="mt-2 rounded-lg bg-canvas px-3 py-2 text-[13px]">
            <summary className="cursor-pointer font-medium text-ink">Raw events ({events.length})</summary>
            <ul className="mt-2 space-y-1">
              {events.map((e) =>
            <li key={e.id} className="tnum flex gap-3 text-xs text-muted"><span className="w-10 text-ink">{secToLabel(e.sec)}</span><span className="flex-1">{e.detail}</span><span>{e.source}</span></li>
            )}
            </ul>
          </details>
        }
      </section>

      <section aria-labelledby="exp-h" className="rounded-2xl border border-line bg-surface p-5">
        <h2 id="exp-h" className="text-sm font-semibold text-ink">2 · Your explanations & requests</h2>
        {corrections.length === 0 ?
        <p className="mt-3 text-sm text-muted">No explanations or correction requests for this day.</p> :

        <ul className="mt-3 space-y-3">
            {corrections.map((c) =>
          <li key={c.id} className="rounded-xl border border-line p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-ink">{c.original} → {c.requested}</p>
                  <StatusBadge tone={correctionLabels[c.status].tone} label={correctionLabels[c.status].label} />
                </div>
                <p className="mt-1 text-xs text-muted">“{c.reason}”</p>
                <ol className="mt-2.5 space-y-1 border-l border-line pl-3">
                  {c.history.map((h, i) =>
              <li key={i} className="tnum text-xs text-muted">
                      <span className="text-ink">{fmtDate(h.date, 'd MMM')} {h.time}</span> · {h.actor} · {correctionLabels[h.status].label}{h.note ? ` — “${h.note}”` : ''}
                    </li>
              )}
                </ol>
              </li>
          )}
          </ul>
        }
      </section>

      <section aria-labelledby="res-h" className={twMerge('rounded-2xl border p-5', st === 'approved' ? 'border-success-line bg-success-soft' : 'border-line bg-surface')}>
        <h2 id="res-h" className="text-sm font-semibold text-ink">3 · Approved result</h2>
        {st === 'approved' ?
        <p className="tnum mt-2 text-sm text-ink">
            <strong className="text-2xl">{fmtHours(t.approvedEstimate)} h</strong> approved by Pieter van Wyk
            {corrections.some((c) => c.status === 'approved') && <span className="ml-2"><StatusBadge tone="primary" label="Corrected" /></span>}
          </p> :

        <p className="mt-2 text-sm text-muted">
            {st === 'submitted' ? 'Submitted — awaiting review. ' : 'Not submitted yet. '}
            Nothing is shown as approved until your manager approves it. Pending requests are <strong className="text-ink">not</strong> applied.
          </p>
        }
      </section>
    </div>);

}