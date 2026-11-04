import { useClock, useDemo } from '../../contexts/DemoStore';
import { actorId } from '../../utils/selectors';
import type { Interval } from '../../types/time';
import { dayTotals, intervalsFor } from '../../utils/selectors';
import { TODAY, fmtDur, secToLabel } from '../../utils/time';
import { Banner } from '../shared/Banner';
import { Button } from '../shared/Button';
import { Dialog } from '../shared/Dialog';
import { TimelineBar } from '../shared/TimelineBar';
import { DayIntervalList } from './DayIntervalList';

interface Props {
  open: boolean;
  onClose: () => void;
  onExplain: (iv: Interval) => void;
}

export function EndOfDayDialog({ open, onClose, onExplain }: Props) {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const ivs = intervalsFor(state, actorId(state), TODAY);
  const t = dayTotals(ivs, clock);
  const noTask = ivs.filter((i) => i.type === 'work' && !i.projectId && !i.category).length;
  const submitted = state.daySubmissions[TODAY] === 'submitted';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Your day — Monday 26 October"
      description="These are recorded values. Your approved timesheet may differ after company policy, corrections and review."
      footer={
      submitted ?
      <Button onClick={onClose}>Done</Button> :

      <>
            <Button variant="secondary" onClick={onClose}>Resolve later</Button>
            <Button onClick={() => {dispatch({ type: 'SUBMIT_DAY' });onClose();}}>Submit day for review</Button>
          </>

      }>
      
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
          ['Attendance', t.firstStart !== undefined ? `${secToLabel(t.firstStart)}–${secToLabel(t.lastEnd ?? clock)}` : '—'],
          ['Recorded work', fmtDur(t.work)],
          ['Breaks', fmtDur(t.breaks)],
          ['Idle observations', `${t.idleCount} · ${fmtDur(t.idleUnresolved + t.idlePending + t.idleApproved + t.idleRejected)}`]].
          map(([k, v]) =>
          <div key={k} className="rounded-xl bg-hover px-3 py-2.5">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="tnum mt-0.5 text-sm font-semibold text-ink">{v}</dd>
            </div>
          )}
        </dl>
        <TimelineBar intervals={ivs} now={clock} />
        {t.unresolvedCount > 0 &&
        <Banner tone="warning" title={`${t.unresolvedCount} interval${t.unresolvedCount > 1 ? 's' : ''} without an explanation`}>
            You can still submit your day. Unexplained intervals stay flagged for your manager — you can add an explanation now or later.
          </Banner>
        }
        {noTask > 0 &&
        <Banner tone="info" title="Some work has no task">
            {noTask} interval{noTask > 1 ? 's have' : ' has'} no project or category. Your manager may ask you to allocate it.
          </Banner>
        }
        {submitted && <Banner tone="success" title="Submitted for review">Your manager has been notified. You can still explain intervals until the timesheet is approved.</Banner>}
        <DayIntervalList intervals={ivs} now={clock} onExplain={(iv) => {onClose();onExplain(iv);}} dense />
      </div>
    </Dialog>);

}