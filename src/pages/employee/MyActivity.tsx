import { useState } from 'react';
import { ActivityIcon, CloudUploadIcon, EyeOffIcon, MonitorIcon, ShieldCheckIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { CorrectionDialog, type CorrectionTarget } from '../../components/employee/CorrectionDialog';
import { PageHeader } from '../../components/employee/PageHeader';
import { Banner } from '../../components/shared/Banner';
import { Button } from '../../components/shared/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { Segmented } from '../../components/shared/Segmented';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { actorId } from '../../utils/selectors';
import { trackingPolicy } from '../../data/policy';
import { correctionLabels, intervalLabels } from '../../data/statusLabels';
import type { EventKind } from '../../types/time';
import { intervalsFor } from '../../utils/selectors';
import { TODAY, fmtDate, fmtDur, range, secToLabel } from '../../utils/time';

const eventLabels: Record<EventKind, string> = {
  clock_in: 'Work session started',
  clock_out: 'Work session ended',
  break_start: 'Break started',
  break_end: 'Break ended',
  idle_start: 'Operating-system idle threshold reached',
  active_resumed: 'Active state resumed',
  task_switch: 'Task switched',
  sync: 'Synchronisation completed',
  correction_submitted: 'Time correction submitted',
  decision: 'Manager decision received',
  clock_out_reversed: 'Clock-out reversed'
};

const days = ['2026-10-26', '2026-10-23', '2026-10-22'];

export function MyActivity() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const layout = useEmployeeLayout();
  const [date, setDate] = useState(TODAY);
  const [target, setTarget] = useState<CorrectionTarget>(null);
  const idle = intervalsFor(state, actorId(state), date).filter((i) => i.type === 'idle');
  const events = [
  ...state.events.filter((e) => e.date === date && e.memberId === actorId(state)).map((e) => ({ sec: e.sec, title: eventLabels[e.kind], detail: e.detail, source: e.source })),
  ...state.corrections.
  filter((c) => c.memberId === actorId(state) && c.date === date).
  flatMap((c) => c.history.filter((h) => ['approved', 'rejected', 'info_requested'].includes(h.status) && h.date === date).map((h) => ({ sec: Number(h.time.slice(0, 2)) * 3600 + Number(h.time.slice(3)) * 60, title: eventLabels.decision, detail: `${h.actor}: ${correctionLabels[h.status].label}${h.note ? ` — “${h.note}”` : ''}`, source: 'server' as const })))].
  sort((a, b) => a.sec - b.sec);
  const queued = state.agent.queue.length;

  return (
    <div className={twMerge('mx-auto max-w-6xl', layout === 'narrow' ? 'space-y-4 p-4' : 'space-y-6 p-8')}>
      <PageHeader title="My Activity" description="What the system observed, and your explanations. An observation is not a judgement about your work." />

      <section aria-labelledby="privacy-h" className="rounded-2xl border border-teal-line bg-teal-soft p-5">
        <div className={twMerge('grid gap-5', layout === 'wide' && 'grid-cols-[1fr_1fr_auto] items-start')}>
          <div>
            <h2 id="privacy-h" className="flex items-center gap-2 text-sm font-semibold text-ink"><ShieldCheckIcon className="h-4 w-4 text-teal-dark" aria-hidden />What’s collected</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink/80">Clock and break times you record, and — only while you’re clocked in with the desktop agent signed in — the times your computer became idle (no input for {trackingPolicy.idleThresholdMin} min, set by your employer) and active again.</p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink"><EyeOffIcon className="h-4 w-4 text-teal-dark" aria-hidden />Never collected</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink/80">Keystrokes, screenshots, webcam, microphone, browsing history, messages or location. Your manager and HR can see observations and your explanations.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'policy' } })}>Full tracking policy</Button>
        </div>
      </section>

      {queued > 0 &&
      <Banner tone="info" icon={CloudUploadIcon} title={`${queued} agent event${queued === 1 ? '' : 's'} not yet synchronised`}>
          Your desktop agent is offline and saved these on your computer. They’ll appear here once they reach the server.
        </Banner>
      }

      <Segmented label="Choose day" value={date} onChange={setDate} options={days.map((d) => ({ value: d, label: d === TODAY ? 'Today' : fmtDate(d, 'EEE d MMM') }))} />

      <div className={twMerge('grid gap-6', layout === 'wide' && 'grid-cols-[minmax(0,1fr)_360px]')}>
        <section aria-labelledby="idle-h" className="min-w-0 space-y-3">
          <h2 id="idle-h" className="text-sm font-semibold text-ink">Inactivity intervals</h2>
          {idle.length === 0 ?
          <div className="rounded-2xl border border-line bg-surface">
              <EmptyState icon={ActivityIcon} title="No inactivity observed" body="Your desktop agent didn’t record any idle intervals on this day." />
            </div> :

          idle.map((iv) => {
            const c = iv.correctionId ? state.corrections.find((x) => x.id === iv.correctionId) : undefined;
            const dur = (iv.endSec ?? clock) - iv.startSec;
            const lbl = intervalLabels[iv.status];
            const required = dur > trackingPolicy.explanationOverMin * 60;
            return (
              <article key={iv.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="tnum text-base font-semibold text-ink">{range(iv.startSec, iv.endSec)} <span className="text-sm font-normal text-muted">· {iv.endSec === undefined ? 'ongoing' : fmtDur(dur)}</span></p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted"><MonitorIcon className="h-3.5 w-3.5" aria-hidden />Observed by Windows desktop agent</p>
                    </div>
                    <StatusBadge tone={lbl.tone} label={lbl.label} size="md" />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-3">
                    <div><dt className="text-xs text-muted">Classification</dt><dd className="font-medium text-ink">{iv.classification ?? 'Not classified'}</dd></div>
                    <div><dt className="text-xs text-muted">Explanation</dt><dd className="font-medium text-ink">{required ? `Requested (over ${trackingPolicy.explanationOverMin} min)` : 'Optional'}</dd></div>
                    <div><dt className="text-xs text-muted">Counts as</dt><dd className="font-medium text-ink">{iv.status === 'rejected' ? 'Not worked (manager decision)' : 'Recorded time, pending review'}</dd></div>
                  </dl>
                  {c &&
                <div className="mt-3 rounded-xl bg-canvas p-3 text-[13px]">
                      <p className="text-ink"><span className="font-medium">Your explanation:</span> {c.classification} — “{c.reason}”</p>
                      <p className="tnum mt-1 text-xs text-muted">Submitted {fmtDate(c.history[0].date, 'd MMM')} {c.history[0].time} · {correctionLabels[c.status].label}</p>
                      {c.decisionReason && <p className="mt-1.5 text-xs text-ink"><span className="font-medium">{c.reviewer}:</span> “{c.decisionReason}”</p>}
                    </div>
                }
                  <div className="mt-3 flex flex-wrap gap-2">
                    {iv.endSec !== undefined && (iv.status === 'unclassified' || iv.status === 'info_requested') &&
                  <Button size="sm" onClick={() => setTarget({ mode: 'idle', interval: iv })}>{iv.status === 'info_requested' ? 'Reply to manager' : 'Explain this interval'}</Button>
                  }
                    {c && c.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'WITHDRAW_CORRECTION', id: c.id })}>Withdraw explanation</Button>}
                  </div>
                </article>);

          })
          }
        </section>

        <section aria-labelledby="ev-h" className="rounded-2xl border border-line bg-surface p-5">
          <h2 id="ev-h" className="text-sm font-semibold text-ink">Event timeline</h2>
          {events.length === 0 ?
          <p className="mt-3 text-sm text-muted">No events recorded for this day in the demo data.</p> :

          <ol className="mt-4 space-y-4 border-l border-line pl-4">
              {events.map((e, i) =>
            <li key={i} className="relative">
                  <span aria-hidden className={twMerge('absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-surface', e.source === 'agent' ? 'bg-warning-fill' : e.source === 'server' ? 'bg-info' : 'bg-primary')} />
                  <p className="text-[13px] font-medium text-ink">{e.title}</p>
                  <p className="tnum text-xs text-muted">{secToLabel(e.sec)} · {e.source === 'agent' ? 'Desktop agent' : e.source === 'server' ? 'MzansiWork' : 'Browser'}</p>
                  <p className="mt-0.5 text-xs text-muted">{e.detail}</p>
                </li>
            )}
            </ol>
          }
        </section>
      </div>

      <CorrectionDialog target={target} onClose={() => setTarget(null)} />
    </div>);

}