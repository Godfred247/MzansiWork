import React, { useState } from 'react';
import { BriefcaseIcon, CoffeeIcon, MoonIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Avatar } from '../../../components/shared/Avatar';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { Sheet } from '../../../components/shared/Sheet';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { TextArea } from '../../../components/shared/TextArea';
import { TextInput } from '../../../components/shared/TextInput';
import { TimelineBar } from '../../../components/shared/TimelineBar';
import { TimelineLegend } from '../../../components/shared/TimelineLegend';
import { useClock, useDemo } from '../../../contexts/DemoStore';
import { actorId } from '../../../utils/selectors';
import { attendanceLabels, correctionLabels, intervalLabels } from '../../../data/statusLabels';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import { dayTotals, liveMembers, memberDayIntervals, projectName } from '../../../utils/selectors';
import { TODAY, fmtDur, range } from '../../../utils/time';

export function AttendanceDetail() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const { id } = useEmployerParams();
  const m = liveMembers(state, clock, true).find((x) => x.id === id);
  const [adjust, setAdjust] = useState(false);
  const [time, setTime] = useState('06:00');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  if (!m) return <MobileHeader title="Not found" />;

  const overnight = m.attendance === 'missing_clock_out';
  const now = overnight ? clock + 86400 : clock;
  const ivs = overnight ? state.intervals.filter((i) => i.memberId === m.id) : memberDayIntervals(state, m, clock);
  const t = dayTotals(ivs, now);
  const corrections = state.corrections.filter((c) => c.memberId === m.id && c.date === TODAY);
  const audit = state.audit.filter((a) => a.target.includes(m.name) || a.actor === m.name).slice(0, 5);
  const first = m.name.split(' ')[0];

  const exceptions: {tone: 'danger' | 'warning' | 'info';title: string;body: string;action?: React.ReactNode;}[] = [];
  if (m.attendance === 'missing_clock_out') exceptions.push({ tone: 'danger', title: 'Missing clock-out', body: `${first}’s night session started Sun 25 Oct 21:57 and has no clock-out. It crosses midnight, so it counts across both days.`, action: <><Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'TOAST', app: 'employer', message: `Reminder sent to ${first} (simulated)`, tone: 'success' })}>Remind {first}</Button><Button size="sm" onClick={() => setAdjust(true)}>Add adjustment</Button></> });
  if (m.attendance === 'late') exceptions.push({ tone: 'warning', title: 'Late start', body: `Clocked in at ${m.clockIn}, after the scheduled ${m.schedule.start}. No action is required unless your policy says so.` });
  if (m.unresolvedIdle > 0) exceptions.push({ tone: 'warning', title: 'Unclassified inactivity', body: `${m.unresolvedIdle} idle interval${m.unresolvedIdle > 1 ? 's have' : ' has'} no explanation yet. Idle time is an observation — not proof that no work happened.`, action: <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'TOAST', app: 'employer', message: `Friendly reminder sent to ${first} (simulated)`, tone: 'success' })}>Remind {first}</Button> });
  if (corrections.some((c) => c.status === 'pending')) exceptions.push({ tone: 'warning', title: 'Pending correction', body: 'A correction request for today is awaiting review.', action: <Button size="sm" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'correction', params: { id: corrections.find((c) => c.status === 'pending')!.id } } })}>Review request</Button> });
  if (m.id === actorId(state) && state.agent.queue.length) exceptions.push({ tone: 'info', title: 'Offline events awaiting sync', body: `${state.agent.queue.length} desktop-agent events are queued on ${first}’s computer. Totals may change once they arrive.` });
  if (m.attendance === 'on_leave') exceptions.push({ tone: 'info', title: 'On approved leave', body: 'Annual leave Mon 26 – Fri 30 Oct.' });

  return (
    <>
      <MobileHeader title={m.name} subtitle="Mon 26 Oct 2026" />
      <ScreenBody>
        <div className="flex items-center gap-3">
          <Avatar name={m.name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-ink">{m.name}</p>
            <p className="text-xs text-muted">{m.title} · {m.department} · {m.branch}</p>
          </div>
          <StatusBadge tone={attendanceLabels[m.attendance].tone} label={attendanceLabels[m.attendance].label} size="md" />
        </div>

        {exceptions.map((e) => <Banner key={e.title} tone={e.tone} title={e.title} action={e.action}>{e.body}</Banner>)}

        <dl className="grid grid-cols-2 gap-2">
          {[['Scheduled', `${m.schedule.start}–${m.schedule.end}`], ['Recorded attendance', t.attendance ? fmtDur(t.attendance) : '—'], ['Work intervals', fmtDur(t.work)], ['Breaks', fmtDur(t.breaks)]].map(([k, v]) =>
          <div key={k} className="rounded-xl bg-surface px-3 py-2.5 shadow-card"><dt className="text-[11px] text-muted">{k}</dt><dd className="tnum text-sm font-semibold text-ink">{v}</dd></div>
          )}
        </dl>

        <MSection title="Timeline" footer="Solid = recorded attendance. Hatched = raw desktop-agent observations; they never change recorded or approved time on their own.">
          <div className="space-y-2 p-4">
            <TimelineBar intervals={ivs} now={now} dayStart={m.schedule.overnight ? 20 * 3600 : 6 * 3600} dayEnd={m.schedule.overnight ? 36 * 3600 : 19 * 3600} />
            <TimelineLegend />
          </div>
        </MSection>

        <MSection title="Intervals">
          {ivs.length === 0 && <MRow title="No intervals recorded today" />}
          {ivs.map((iv) => {
            const c = iv.correctionId ? state.corrections.find((x) => x.id === iv.correctionId) : undefined;
            const Icon = iv.type === 'work' ? BriefcaseIcon : iv.type === 'break' ? CoffeeIcon : MoonIcon;
            const lbl = iv.type === 'idle' ? intervalLabels[iv.status] : { label: 'Recorded', tone: 'neutral' as const };
            return (
              <MRow
                key={iv.id}
                leading={<Icon className="h-4 w-4 text-muted" aria-hidden />}
                title={<span className="tnum">{range(iv.startSec, iv.endSec)} · {fmtDur((iv.endSec ?? now) - iv.startSec)}</span>}
                subtitle={iv.type === 'work' ? projectName(state, iv.projectId) ?? iv.category ?? 'Work' : iv.type === 'break' ? iv.breakCategory : c ? `Employee: “${c.classification}” — ${correctionLabels[c.status].label}` : iv.classification ? `Approved as ${iv.classification}` : 'Agent observation · no explanation yet'}
                trailing={<StatusBadge tone={lbl.tone} label={lbl.label} />}
                onClick={c ? () => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'correction', params: { id: c.id } } }) : undefined} />);


          })}
        </MSection>

        {corrections.length > 0 &&
        <MSection title="Correction requests">
            {corrections.map((c) => <MRow key={c.id} title={`${c.original} → ${c.requested}`} subtitle={c.reason} trailing={<StatusBadge tone={correctionLabels[c.status].tone} label={correctionLabels[c.status].label} />} onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'correction', params: { id: c.id } } })} />)}
          </MSection>
        }

        <MSection title="Audit trail" footer="Original timestamps are never overwritten.">
          {audit.length === 0 ? <MRow title="No audit events for this record" /> : audit.map((a) => <MRow key={a.id} title={a.action} subtitle={`${a.actor} · ${a.date.slice(8)} Oct ${a.time}${a.reason ? ` · “${a.reason}”` : ''}`} />)}
        </MSection>
      </ScreenBody>

      <Sheet
        open={adjust}
        onClose={() => setAdjust(false)}
        title="Add manager adjustment"
        description="The original record is kept. Your adjustment and reason are added to the audit trail and the employee is notified."
        footer={
        <Button full onClick={() => {
          setTried(true);
          if (reason.trim().length < 10) return;
          dispatch({ type: 'AUDIT_LOG', category: 'attendance', action: `Added clock-out adjustment ${time}`, target: `${m.name} · session 25 Oct 21:57`, reason: reason.trim(), toast: 'Adjustment recorded — original event kept, employee notified' });
          setAdjust(false);setReason('');setTried(false);
        }}>Save adjustment</Button>
        }>
        
        <div className="space-y-4">
          <Field label="Clock-out time (Mon 26 Oct)" htmlFor="adj-time"><TextInput id="adj-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          <Field label="Reason (required)" htmlFor="adj-reason" error={tried && reason.trim().length < 10 ? 'A reason is required for any change to recorded working time.' : ''}>
            <TextArea id="adj-reason" value={reason} invalid={tried && reason.trim().length < 10} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Confirmed with Ruan by phone; shift ended at 06:00 handover." />
          </Field>
        </div>
      </Sheet>
    </>);

}