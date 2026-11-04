import React, { useState } from 'react';
import { AlarmClockOffIcon, BellIcon, ChevronRightIcon, InboxIcon, MoonIcon, PlaneIcon, UserXIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { RowIcon } from '../../../components/employer/RowIcon';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { WeeklyTrendChart } from '../../../components/employer/WeeklyTrendChart';
import { Avatar } from '../../../components/shared/Avatar';
import { IconButton } from '../../../components/shared/IconButton';
import { Segmented } from '../../../components/shared/Segmented';
import { Skeleton } from '../../../components/shared/Skeleton';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useClock, useDemo } from '../../../contexts/DemoStore';
import { weeklyHours } from '../../../data/dashboard';
import { attendanceLabels, leaveTypeLabels } from '../../../data/statusLabels';
import { useSimulatedLoad } from '../../../hooks/useSimulatedLoad';
import type { Branch } from '../../../types/org';
import { approverScope } from '../../../data/permissions';
import { inScope, signedInName } from '../../../utils/permissions';
import { liveMembers, memberById, pendingCorrections, pendingLeave } from '../../../utils/selectors';
import { TODAY, fmtDate, fmtDur, johannesburgNow, labelToSec } from '../../../utils/time';
import { isLiveOrg } from '../../../utils/workspace';

const IN = ['clocked_in', 'late', 'requires_review', 'pending_correction'];

export function Dashboard() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const loading = useSimulatedLoad(500);
  const [branch, setBranch] = useState<'all' | Branch>('all');
  const role = state.viewerRole;
  const all = liveMembers(state, clock).filter((m) => inScope(role, m.id) && (branch === 'all' || m.branch === branch));
  const expected = all.filter((m) => m.attendance !== 'day_off' && m.attendance !== 'on_leave');
  const inNow = all.filter((m) => IN.includes(m.attendance));
  const onBreak = all.filter((m) => m.attendance === 'on_break');
  const out = all.filter((m) => m.attendance === 'clocked_out');
  const notIn = all.filter((m) => m.attendance === 'not_clocked_in' || m.attendance === 'missing_clock_out');
  const overdue = all.filter((m) => m.attendance === 'not_clocked_in' && clock > labelToSec(m.schedule.start) + 900);
  const corr = pendingCorrections(state, role);
  const lv = pendingLeave(state, role);
  const unresolved = all.filter((m) => m.unresolvedIdle > 0);
  const missing = all.filter((m) => m.attendance === 'missing_clock_out');
  const hoursToday = all.reduce((a, m) => a + m.hoursToday, 0);
  const reviewSec = corr.reduce((a, c) => a + (c.durationSec ?? 0), 0) + state.intervals.filter((i) => i.type === 'idle' && i.status === 'unclassified' && !i.queued && i.endSec && inScope(role, i.memberId)).reduce((a, i) => a + ((i.endSec ?? 0) - i.startSec), 0);
  const unread = state.notifications.filter((n) => n.app === 'employer' && !n.read).length;
  const live = isLiveOrg(state.orgId) && !state.flow;
  const todayIso = live ? johannesburgNow().iso : TODAY;
  const outToday = state.leave.filter((l) => l.status === 'approved' && l.start <= todayIso && l.end >= todayIso && inScope(role, l.memberId));
  const upcoming = state.leave.filter((l) => (l.status === 'approved' || l.status === 'pending') && l.start > todayIso && inScope(role, l.memberId)).slice(0, 3);
  const trend = [...weeklyHours, { day: 'Today', hours: hoursToday, live: true }];
  const segments = [
  { n: inNow.length, cls: 'bg-success', label: 'Working' },
  { n: onBreak.length, cls: 'bg-info', label: 'On break' },
  { n: out.length, cls: 'bg-subtle', label: 'Clocked out' },
  { n: notIn.length, cls: 'bg-line', label: 'Not in' }];

  const greetingSec = ((clock % 86400) + 86400) % 86400;
  const greeting = greetingSec < 12 * 3600 ? 'Good morning' : greetingSec < 17 * 3600 ? 'Good afternoon' : 'Good evening';
  const firstName = signedInName(state).split(' ')[0];
  const branches = state.org.branches.filter(Boolean);

  const attention = [
  missing.length && { icon: AlarmClockOffIcon, tone: 'danger' as const, title: `${missing.length} missing clock-out`, sub: missing.map((m) => m.name).join(', '), go: () => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'attendance-detail', params: { id: missing[0].id } } }) },
  corr.length && { icon: InboxIcon, tone: 'warning' as const, title: `${corr.length} correction${corr.length > 1 ? 's' : ''} to review`, sub: corr.map((c) => memberById(state, c.memberId)?.name.split(' ')[0]).join(', '), go: () => dispatch({ type: 'EMPLOYER_TAB', tab: 'approvals' }) },
  lv.length && { icon: PlaneIcon, tone: 'primary' as const, title: `${lv.length} leave request${lv.length > 1 ? 's' : ''}`, sub: lv.map((l) => memberById(state, l.memberId)?.name.split(' ')[0]).join(', '), go: () => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'approvals', params: { tab: 'leave' } } }) },
  unresolved.length && { icon: MoonIcon, tone: 'neutral' as const, title: `${unresolved.length} with unexplained idle time`, sub: 'Observations awaiting employee explanation', go: () => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'attendance', params: { filter: 'action' } } }) },
  overdue.length && { icon: UserXIcon, tone: 'neutral' as const, title: `${overdue.length} not in after scheduled start`, sub: overdue.map((m) => `${m.name.split(' ')[0]} (${m.schedule.start})`).join(', '), go: () => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'attendance', params: { filter: 'out' } } }) }].
  filter(Boolean) as {icon: React.ElementType;tone: 'danger' | 'warning' | 'primary' | 'neutral';title: string;sub: string;go: () => void;}[];

  const preview = [...all].sort((a, b) => Number(!!b.unresolvedIdle || b.attendance === 'missing_clock_out') - Number(!!a.unresolvedIdle || a.attendance === 'missing_clock_out')).slice(0, 5);

  return (
    <>
      <MobileHeader
        large
        title={`${greeting}, ${firstName}`}
        subtitle={`${fmtDate(todayIso, 'EEEE d MMMM')} · ${state.org.name.replace(' (Pty) Ltd', '')}`}
        actions={
        <>
            <IconButton label="Notifications" badge={unread} onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'notifications' } })}><BellIcon className="h-5 w-5" /></IconButton>
            <button onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'profile' } })} aria-label="Profile and security"><Avatar name={signedInName(state)} size="sm" /></button>
          </>
        } />
      
      <ScreenBody className="pt-2">
        {role === 'approver' ?
        <p className="rounded-xl bg-primary-soft px-3 py-2 text-xs text-primary">Delegated approver · {approverScope.team} team only · until {fmtDate(approverScope.until, 'd MMM')}</p> :

        branches.length > 0 && <Segmented full label="Branch" value={branch} onChange={setBranch} options={[{ value: 'all', label: 'All branches' }, ...branches.map((name) => ({ value: name, label: name === 'Johannesburg' ? 'Joburg' : name }))]} />
        }

        {loading ?
        <div className="space-y-3"><Skeleton className="h-36 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div> :

        <>
            <section aria-labelledby="otc" className="rounded-2xl bg-navy p-4 text-white shadow-card">
              <p id="otc" className="text-[13px] text-navy-100">On the clock now</p>
              <p className="tnum mt-1 text-4xl font-bold tracking-tight">{inNow.length + onBreak.length}<span className="ml-1.5 text-base font-medium text-navy-300">of {expected.length} expected</span></p>
              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10" aria-hidden>
                {segments.map((s) => <span key={s.label} className={s.cls} style={{ width: `${s.n / Math.max(all.length, 1) * 100}%` }} />)}
              </div>
              <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-navy-100">
                {segments.map((s) => <li key={s.label} className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${s.cls}`} aria-hidden /><span className="tnum">{s.n}</span> {s.label}</li>)}
                <li className="tnum">{all.length - expected.length} on leave / off</li>
              </ul>
            </section>

            <MSection title="Needs attention">
              {attention.length === 0 ?
            <MRow title="Nothing needs your attention" subtitle="No exceptions or pending requests" /> :

            attention.map((a) => <MRow key={a.title} leading={<RowIcon icon={a.icon} tone={a.tone} />} title={a.title} subtitle={a.sub} onClick={a.go} />)
            }
            </MSection>

            <div className="grid grid-cols-3 gap-2">
              {[
            ['Active staff', all.length],
            ['Not clocked in', notIn.length],
            ['On break', onBreak.length],
            ['Corrections', corr.length],
            ['Leave requests', lv.length],
            ['Hours today', hoursToday.toFixed(1)]].
            map(([k, v]) =>
            <div key={k} className="rounded-xl bg-surface px-3 py-2.5 shadow-card">
                  <p className="tnum text-lg font-semibold text-ink">{v}</p>
                  <p className="text-[11px] text-muted">{k}</p>
                </div>
            )}
            </div>

            <MSection title="Live attendance" action={<button onClick={() => dispatch({ type: 'EMPLOYER_TAB', tab: 'attendance' })} className="flex items-center text-[13px] font-medium text-primary">See all<ChevronRightIcon className="h-4 w-4" aria-hidden /></button>}>
              {preview.map((m) =>
            <MRow
              key={m.id}
              leading={<Avatar name={m.name} size="sm" status={IN.includes(m.attendance) ? 'online' : m.attendance === 'on_break' ? 'break' : 'off'} />}
              title={m.name}
              subtitle={m.breakNow ?? `${m.department} · ${m.clockIn ? `in ${m.clockIn}` : `starts ${m.schedule.start}`}${m.unresolvedIdle ? ` · ${m.unresolvedIdle} idle to review` : ''}`}
              trailing={<StatusBadge tone={attendanceLabels[m.attendance].tone} label={attendanceLabels[m.attendance].label} />}
              onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'attendance-detail', params: { id: m.id } } })} />

            )}
            </MSection>

            <MSection title="Hours recorded this week" footer="Raw recorded hours. Approved totals are in Reports → Weekly timesheets.">
              <div className="p-3"><WeeklyTrendChart data={trend} /></div>
            </MSection>

            <MSection title="Leave">
              {outToday.map((l) => <MRow key={l.id} leading={<Avatar name={memberById(state, l.memberId)?.name ?? ''} size="sm" />} title={`${memberById(state, l.memberId)?.name} · out today`} subtitle={`${leaveTypeLabels[l.type]} until ${fmtDate(l.end, 'EEE d MMM')}`} />)}
              {upcoming.map((l) => <MRow key={l.id} title={memberById(state, l.memberId)?.name} subtitle={`${leaveTypeLabels[l.type]} · ${fmtDate(l.start, 'd MMM')}–${fmtDate(l.end, 'd MMM')}`} trailing={<StatusBadge tone={l.status === 'approved' ? 'success' : 'warning'} label={l.status === 'approved' ? 'Approved' : 'Pending'} />} />)}
              <MRow title="Team leave calendar" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'leave' } })} />
            </MSection>

            <MSection title="Time awaiting review">
              <MRow title={<span className="tnum">{fmtDur(reviewSec)}</span>} subtitle="Pending corrections and unexplained idle observations. Not deducted automatically." onClick={() => dispatch({ type: 'EMPLOYER_TAB', tab: 'approvals' })} />
            </MSection>
          </>
        }
      </ScreenBody>
    </>);

}