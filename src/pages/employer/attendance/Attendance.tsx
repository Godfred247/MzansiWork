import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, SearchIcon, SlidersHorizontalIcon, UsersIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Avatar } from '../../../components/shared/Avatar';
import { Button } from '../../../components/shared/Button';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Field } from '../../../components/shared/Field';
import { IconButton } from '../../../components/shared/IconButton';
import { Segmented } from '../../../components/shared/Segmented';
import { SelectInput } from '../../../components/shared/SelectInput';
import { Sheet } from '../../../components/shared/Sheet';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { TextInput } from '../../../components/shared/TextInput';
import { TimelineBar } from '../../../components/shared/TimelineBar';
import { useClock, useDemo } from '../../../contexts/DemoStore';
import { memberWeek } from '../../../data/dashboard';
import { departments } from '../../../data/members';
import { attendanceLabels } from '../../../data/statusLabels';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import { can, inScope } from '../../../utils/permissions';
import { liveMembers, memberDayIntervals } from '../../../utils/selectors';
import { uid } from '../../../utils/store/helpers';

type Filter = 'all' | 'action' | 'in' | 'break' | 'out';
const ACTION = ['missing_clock_out', 'requires_review', 'pending_correction', 'late'];

export function Attendance() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const p = useEmployerParams();
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [day, setDay] = useState<'today' | 'fri'>('today');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>(p.filter as Filter ?? 'all');
  const [dept, setDept] = useState('all');
  const [schedule, setSchedule] = useState('all');
  const [sheet, setSheet] = useState(false);
  const role = state.viewerRole;

  const members = liveMembers(state, clock).filter((m) => inScope(role, m.id)).filter((m) => {
    if (q && !m.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (dept !== 'all' && m.department !== dept) return false;
    if (schedule === 'overnight' && !m.schedule.overnight) return false;
    if (schedule === 'standard' && m.schedule.overnight) return false;
    if (filter === 'action') return ACTION.includes(m.attendance) || m.unresolvedIdle > 0;
    if (filter === 'in') return ['clocked_in', 'late', 'requires_review', 'pending_correction'].includes(m.attendance);
    if (filter === 'break') return m.attendance === 'on_break';
    if (filter === 'out') return ['not_clocked_in', 'clocked_out', 'missing_clock_out'].includes(m.attendance);
    return true;
  });

  const exportNow = () => {
    dispatch({ type: 'EXPORT_START', id: uid('x'), report: 'Daily attendance', format: 'CSV', range: 'Mon 26 Oct 2026', dataType: 'Raw observations' });
    dispatch({ type: 'TOAST', app: 'employer', message: 'Export started — track it in Export centre', tone: 'info' });
  };

  return (
    <>
      <MobileHeader
        large
        title="Attendance"
        actions={
        <>
            {can(role, 'export') && <IconButton label="Export attendance" onClick={exportNow}><DownloadIcon className="h-5 w-5" /></IconButton>}
            <IconButton label="Filters" badge={(dept !== 'all' ? 1 : 0) + (schedule !== 'all' ? 1 : 0)} onClick={() => setSheet(true)}><SlidersHorizontalIcon className="h-5 w-5" /></IconButton>
          </>
        } />
      
      <ScreenBody className="space-y-4 pt-2">
        <Segmented full label="Range" value={view} onChange={setView} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />

        {view === 'day' &&
        <>
            <div className="flex items-center justify-between rounded-xl bg-surface px-2 py-1.5 shadow-card">
              <IconButton label="Previous day" disabled={day === 'fri'} onClick={() => setDay('fri')}><ChevronLeftIcon className="h-4 w-4" /></IconButton>
              <span className="text-sm font-semibold text-ink">{day === 'today' ? 'Today · Mon 26 Oct' : 'Fri 23 Oct'}</span>
              <IconButton label="Next day" disabled={day === 'today'} onClick={() => setDay('today')}><ChevronRightIcon className="h-4 w-4" /></IconButton>
            </div>
            <TextInput aria-label="Search employees" placeholder="Search employees" value={q} onChange={(e) => setQ(e.target.value)} leading={<SearchIcon className="h-4 w-4" />} />
            <div className="scroll-none -mx-4 flex gap-1.5 overflow-x-auto px-4" role="group" aria-label="Status filter">
              {([['all', 'All'], ['action', 'Needs action'], ['in', 'Working'], ['break', 'On break'], ['out', 'Not in / out']] as [Filter, string][]).map(([v, l]) =>
            <button key={v} onClick={() => setFilter(v)} aria-pressed={filter === v} className={twMerge('h-8 shrink-0 rounded-full border px-3 text-[13px] font-medium', filter === v ? 'border-navy bg-navy text-white' : 'border-line bg-surface text-ink')}>{l}</button>
            )}
            </div>

            {members.length === 0 ?
          <EmptyState icon={UsersIcon} title="No one matches" body="Try a different filter or search." action={<Button size="sm" variant="secondary" onClick={() => {setFilter('all');setQ('');setDept('all');setSchedule('all');}}>Clear filters</Button>} /> :
          day === 'fri' ?
          <MSection footer="Previous days show recorded totals. Open a person for their full timeline.">
                {members.map((m) => {
              const h = memberWeek[m.id]?.hours[4] ?? 0;
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                      <Avatar name={m.name} size="sm" />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{m.name}</p><p className="text-xs text-muted">{m.department}</p></div>
                      <span className="tnum text-sm text-ink">{h ? `${h.toFixed(1)} h` : '—'}</span>
                      <StatusBadge tone={memberWeek[m.id]?.approved ? 'success' : 'warning'} label={memberWeek[m.id]?.approved ? 'Approved' : 'Pending'} />
                    </div>);

            })}
              </MSection> :

          <MSection>
                {members.map((m) => {
              const lbl = attendanceLabels[m.attendance];
              return (
                <button key={m.id} onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'attendance-detail', params: { id: m.id } } })} className="block w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-canvas">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                          <p className="truncate text-xs text-muted">{m.schedule.start}–{m.schedule.end}{m.schedule.overnight ? ' (overnight)' : ''} · {m.clockIn ? `in ${m.clockIn}` : 'not in'}{m.hoursToday ? ` · ${m.hoursToday.toFixed(1)} h` : ''}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge tone={lbl.tone} label={lbl.label} />
                          {m.unresolvedIdle > 0 && <span className="text-[11px] font-medium text-warning">{m.unresolvedIdle} idle unexplained</span>}
                        </div>
                      </div>
                      {m.attendance !== 'missing_clock_out' &&
                  <div className="mt-2 pl-11"><TimelineBar intervals={memberDayIntervals(state, m, clock)} now={clock} compact showAxis={false} /></div>
                  }
                      {m.attendance === 'missing_clock_out' && <p className="mt-1.5 pl-11 text-xs text-danger-dark">Session open since Sun 25 Oct 21:57 — crosses midnight</p>}
                    </button>);

            })}
              </MSection>
          }
          </>
        }

        {view === 'week' &&
        <MSection title="Week of 19–23 Oct" footer="Recorded hours per day. Approved status reflects manager review.">
            {members.map((m) => {
            const w = memberWeek[m.id] ?? { hours: [0, 0, 0, 0, 0], approved: false };
            const total = w.hours.reduce((a, b) => a + b, 0);
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-24 min-w-0"><p className="truncate text-[13px] font-medium text-ink">{m.name.split(' ')[0]}</p><p className="tnum text-[11px] text-muted">{total.toFixed(1)} h</p></div>
                  <div className="flex flex-1 items-end gap-1" aria-label={`Daily hours: ${w.hours.join(', ')}`}>
                    {w.hours.map((h, i) => <span key={i} className={twMerge('flex-1 rounded-sm', h ? 'bg-primary' : 'bg-line')} style={{ height: `${Math.max(3, h / 10 * 28)}px` }} />)}
                  </div>
                  <StatusBadge tone={w.approved ? 'success' : 'warning'} label={w.approved ? 'Approved' : 'Pending'} />
                </div>);

          })}
          </MSection>
        }

        {view === 'month' &&
        <MSection title="October 2026 · attendance rate">
            <div className="grid grid-cols-7 gap-1 p-3 text-center text-[10px]">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="font-medium text-muted">{d}</span>)}
              {[null, null, null, ...Array.from({ length: 31 }, (_, i) => i + 1)].map((d, i) => {
              const wk = i % 7 >= 5;
              const rate = d && !wk && d <= 26 ? [96, 93, 100, 92, 95, 89, 97][d % 7] : null;
              return (
                <span key={i} className={twMerge('flex aspect-square flex-col items-center justify-center rounded-md', !d ? '' : wk ? 'bg-canvas text-subtle' : d === 26 ? 'ring-1 ring-primary' : rate ? rate >= 95 ? 'bg-success-soft' : 'bg-warning-soft' : 'bg-canvas')}>
                    {d && <span className="tnum text-ink">{d}</span>}
                    {rate && <span className="tnum text-[9px] text-muted">{rate}%</span>}
                  </span>);

            })}
            </div>
          </MSection>
        }
      </ScreenBody>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Filter attendance" footer={<Button full onClick={() => setSheet(false)}>Show {members.length} people</Button>}>
        <div className="space-y-4">
          <Field label="Department" htmlFor="af-dept"><SelectInput id="af-dept" value={dept} onChange={(e) => setDept(e.target.value)} options={[{ value: 'all', label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} /></Field>
          <Field label="Shift / schedule" htmlFor="af-sch"><SelectInput id="af-sch" value={schedule} onChange={(e) => setSchedule(e.target.value)} options={[{ value: 'all', label: 'All schedules' }, { value: 'standard', label: 'Day schedules' }, { value: 'overnight', label: 'Overnight shifts' }]} /></Field>
        </div>
      </Sheet>
    </>);

}