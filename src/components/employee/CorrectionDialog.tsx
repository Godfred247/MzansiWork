import { useEffect, useState } from 'react';
import { EyeIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDemo } from '../../contexts/DemoStore';
import { inactivityCategories } from '../../data/projects';
import { trackingPolicy } from '../../data/policy';
import type { Interval } from '../../types/time';
import { fmtDate, fmtDur, labelToSec, range, secToLabel } from '../../utils/time';
import { Button } from '../shared/Button';
import { Dialog } from '../shared/Dialog';
import { Field } from '../shared/Field';
import { SelectInput } from '../shared/SelectInput';
import { TextArea } from '../shared/TextArea';
import { TextInput } from '../shared/TextInput';

export type CorrectionTarget = {mode: 'idle';interval: Interval;} | {mode: 'general';date: string;firstStart?: number;lastEnd?: number;} | null;

const kinds = [
{ value: 'clock_in', label: 'Clock-in time' },
{ value: 'clock_out', label: 'Clock-out time' },
{ value: 'break', label: 'A break' },
{ value: 'task', label: 'Task or project allocation' }];


export function CorrectionDialog({ target, onClose }: {target: CorrectionTarget;onClose: () => void;}) {
  const { state, dispatch } = useDemo();
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [kind, setKind] = useState('clock_in');
  const [time, setTime] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setCategory('');
    setReason('');
    setNotes('');
    setKind('clock_in');
    setTime('');
    setTried(false);
  }, [target]);

  if (!target) return <Dialog open={false} onClose={onClose} title="" />;

  const replying = target.mode === 'idle' && target.interval.status === 'info_requested';
  const correction = target.mode === 'idle' && target.interval.correctionId ? state.corrections.find((c) => c.id === target.interval.correctionId) : undefined;
  const errors = {
    category: target.mode === 'idle' && !replying && !category ? 'Choose what this time was.' : '',
    reason: reason.trim().length < 10 ? 'Add a short explanation (at least 10 characters).' : '',
    time: target.mode === 'general' && kind !== 'task' && !time ? 'Enter the correct time.' : ''
  };
  const valid = !errors.category && !errors.reason && !errors.time;

  const original =
  target.mode === 'idle' ?
  `Idle ${range(target.interval.startSec, target.interval.endSec)} (desktop agent observation)` :
  kind === 'clock_in' ?
  target.firstStart !== undefined ? `Clock-in recorded at ${secToLabel(target.firstStart)}` : 'No clock-in recorded' :
  kind === 'clock_out' ?
  target.lastEnd !== undefined ? `Clock-out recorded at ${secToLabel(target.lastEnd)}` : 'No clock-out recorded' :
  kind === 'break' ? 'Recorded break times' : 'Recorded task allocation';

  const submit = () => {
    setTried(true);
    if (!valid) return;
    if (replying && correction) {
      dispatch({ type: 'RESPOND_INFO', id: correction.id, note: reason.trim() });
      onClose();
      return;
    }
    if (target.mode === 'idle') {
      const iv = target.interval;
      dispatch({
        type: 'SUBMIT_CORRECTION',
        payload: {
          kind: 'idle_classification', date: iv.date, intervalId: iv.id, original,
          requested: category === 'This was a break' ? 'Record as a break' : `Classify as work — ${category}`,
          classification: category, reason: reason.trim(), notes: notes.trim() || undefined, source: 'browser', durationSec: (iv.endSec ?? 0) - iv.startSec
        }
      });
    } else {
      dispatch({
        type: 'SUBMIT_CORRECTION',
        payload: {
          kind: kind as 'clock_in', date: target.date, original,
          requested: kind === 'task' ? 'Reallocate time (see explanation)' : `${kinds.find((k) => k.value === kind)?.label} ${time}`,
          reason: reason.trim(), notes: notes.trim() || undefined, source: 'browser',
          durationSec: kind === 'clock_in' && target.firstStart !== undefined && time ? Math.abs(target.firstStart - labelToSec(time)) : undefined
        }
      });
    }
    onClose();
  };

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      size="md"
      title={replying ? 'Reply to your manager' : target.mode === 'idle' ? 'Explain this interval' : 'Request a correction'}
      description={target.mode === 'idle' ? 'Your explanation is stored separately. The original observation is never changed.' : `For ${fmtDate(target.date)}. Your manager reviews every request — nothing changes until it’s approved.`}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{replying ? 'Send reply' : 'Submit for review'}</Button>
        </>
      }>
      
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-hover p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted"><EyeIcon className="h-3.5 w-3.5" aria-hidden />Original record</p>
          <p className="tnum mt-1 text-sm font-medium text-ink">{original}</p>
          {target.mode === 'idle' &&
          <p className="mt-1 text-xs text-muted">
              {fmtDur((target.interval.endSec ?? 0) - target.interval.startSec)} without keyboard or mouse input after the {trackingPolicy.idleThresholdMin}-minute threshold (configurable). This doesn’t mean you weren’t working.
            </p>
          }
        </div>

        {replying && correction &&
        <div className="rounded-xl border border-info-line bg-info-soft p-3.5 text-[13px]">
            <p className="font-semibold text-info">{correction.history[correction.history.length - 1]?.actor} asked:</p>
            <p className="mt-0.5 text-ink">“{correction.history[correction.history.length - 1]?.note}”</p>
          </div>
        }

        {target.mode === 'idle' && !replying &&
        <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-ink">What was this time?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {inactivityCategories.map((c) =>
            <label key={c.id} className={twMerge('flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors duration-150', category === c.id ? 'border-primary bg-primary-soft' : 'border-line hover:bg-hover')}>
                  <input type="radio" name="idle-cat" checked={category === c.id} onChange={() => setCategory(c.id)} className="mt-0.5 h-4 w-4 accent-primary" />
                  <span>
                    <span className="block text-[13px] font-medium text-ink">{c.id}</span>
                    <span className="block text-xs text-muted">{c.hint}</span>
                  </span>
                </label>
            )}
            </div>
            {tried && errors.category && <p role="alert" className="mt-1.5 text-xs text-danger-dark">{errors.category}</p>}
            <p className="mt-2 text-xs text-muted">Categories are configured by your employer.</p>
          </fieldset>
        }

        {target.mode === 'general' &&
        <div className="grid gap-3 sm:grid-cols-2">
            <Field label="What needs correcting?" htmlFor="cr-kind">
              <SelectInput id="cr-kind" value={kind} onChange={(e) => setKind(e.target.value)} options={kinds} />
            </Field>
            {kind !== 'task' &&
          <Field label="Correct time" htmlFor="cr-time" error={tried ? errors.time : ''}>
                <TextInput id="cr-time" type="time" value={time} invalid={tried && !!errors.time} onChange={(e) => setTime(e.target.value)} />
              </Field>
          }
          </div>
        }

        <Field label={replying ? 'Your reply' : 'Explanation'} htmlFor="cr-reason" error={tried ? errors.reason : ''} hint="Keep it brief and factual. Don’t include medical or other sensitive details.">
          <TextArea id="cr-reason" value={reason} invalid={tried && !!errors.reason} onChange={(e) => setReason(e.target.value)} placeholder={target.mode === 'idle' ? 'e.g. Design review with the Shoprite team in the boardroom.' : 'e.g. The portal didn’t load; I started at 08:00.'} />
        </Field>
        {!replying &&
        <Field label="Supporting notes" htmlFor="cr-notes" optional>
            <TextInput id="cr-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Calendar invite: “Checkout review”" />
          </Field>
        }
      </div>
    </Dialog>);

}