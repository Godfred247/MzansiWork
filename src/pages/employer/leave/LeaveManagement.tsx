import { useMemo, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isWeekend, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, PlaneIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Avatar } from '../../../components/shared/Avatar';
import { Button } from '../../../components/shared/Button';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Segmented } from '../../../components/shared/Segmented';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../contexts/DemoStore';
import { publicHolidays } from '../../../data/holidays';
import { leaveLabels, leaveTypeLabels } from '../../../data/statusLabels';
import type { LeaveStatus } from '../../../types/time';
import { inScope } from '../../../utils/permissions';
import { memberById } from '../../../utils/selectors';
import { TODAY, fmtDate } from '../../../utils/time';

type Filter = 'pending' | 'approved' | 'rejected' | 'upcoming';

export function LeaveManagement() {
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState<Filter>('pending');
  const [month, setMonth] = useState(startOfMonth(parseISO(TODAY)));
  const visible = state.leave.filter((l) => inScope(state.viewerRole, l.memberId));

  const list = visible.filter((l) => {
    if (filter === 'pending') return l.status === 'pending' || l.status === 'info_requested';
    if (filter === 'approved') return l.status === 'approved';
    if (filter === 'rejected') return l.status === 'rejected';
    return (l.status === 'approved' || l.status === 'pending') && l.end >= TODAY;
  });

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [month]);

  const onDay = (iso: string) => visible.filter((l) => (l.status === 'approved' || l.status === 'pending') && l.start <= iso && l.end >= iso);

  return (
    <>
      <MobileHeader title="Leave" subtitle="Balances stay configurable pending current South African law" />
      <ScreenBody>
        <MSection title="Team calendar" footer="Green is approved. Amber is still pending. Public holidays use the configured South African calendar.">
          <div className="px-3 pb-3 pt-2">
            <div className="mb-2 flex items-center justify-between">
              <button aria-label="Previous month" className="rounded-md p-1.5 text-muted hover:bg-hover" onClick={() => setMonth((m) => addMonths(m, -1))}>
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <p className="text-sm font-semibold text-ink">{format(month, 'MMMM yyyy')}</p>
              <button aria-label="Next month" className="rounded-md p-1.5 text-muted hover:bg-hover" onClick={() => setMonth((m) => addMonths(m, 1))}>
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {days.map((d) => {
                const iso = format(d, 'yyyy-MM-dd');
                const hits = onDay(iso);
                const holiday = publicHolidays.find((h) => h.date === iso);
                const inMonth = isSameMonth(d, month);
                return (
                  <div
                    key={iso}
                    title={holiday?.name}
                    className={twMerge('flex min-h-9 flex-col items-center rounded-md py-1 text-[11px]', !inMonth && 'opacity-30', iso === TODAY && 'ring-1 ring-primary', isWeekend(d) && 'bg-hover')}>
                    <span className="tnum text-ink">{format(d, 'd')}</span>
                    <span className="mt-0.5 flex gap-0.5">
                      {hits.slice(0, 3).map((h) => <span key={h.id} className={twMerge('h-1.5 w-1.5 rounded-full', h.status === 'approved' ? 'bg-success' : 'bg-warning-fill')} />)}
                    </span>
                  </div>);
              })}
            </div>
          </div>
        </MSection>

        <Segmented
          full
          label="Leave lists"
          value={filter}
          onChange={setFilter}
          options={[
          { value: 'pending', label: 'Pending' },
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' }]
          } />

        {list.length === 0 ?
        <EmptyState icon={PlaneIcon} title="Nothing in this list" body="Change the filter, or wait for an employee to submit a request." /> :
        <MSection>
            {list.map((l) => {
              const name = memberById(state, l.memberId)?.name ?? 'Employee';
              const tone = leaveLabels[l.status as LeaveStatus];
              return (
                <MRow
                  key={l.id}
                  leading={<Avatar name={name} size="sm" />}
                  title={name}
                  subtitle={`${leaveTypeLabels[l.type]} · ${fmtDate(l.start, 'd MMM')}–${fmtDate(l.end, 'd MMM')} · ${l.days}d`}
                  trailing={<StatusBadge tone={tone.tone} label={tone.label} />}
                  onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'leave-request', params: { id: l.id } } })} />);
            })}
          </MSection>
        }

        <MSection title="Leave types in this organisation" footer="Do not treat this list as automatic entitlement. Eligibility, accrual and evidence stay configurable and must be checked against current law before production.">
          {state.balances.map((b) =>
          <MRow
            key={b.type}
            title={leaveTypeLabels[b.type]}
            subtitle={b.note}
            trailing={<span className="tnum text-xs font-medium text-ink">{b.available === null ? 'Policy' : `${b.available}d`}</span>}
            chevron={false} />
          )}
        </MSection>
        <Button full variant="secondary" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'approvals', params: { tab: 'leave' } } })}>Open the approval inbox</Button>
      </ScreenBody>
    </>);
}
