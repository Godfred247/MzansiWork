import { twMerge } from 'tailwind-merge';
import type { Interval } from '../../types/time';
import { fmtDur, range, secToLabel } from '../../utils/time';

interface TimelineBarProps {
  intervals: Interval[];
  now: number;
  dayStart?: number;
  dayEnd?: number;
  compact?: boolean;
  showAxis?: boolean;
  onSelect?: (iv: Interval) => void;
  selectedId?: string;
}

function idleClass(iv: Interval) {
  if (iv.status === 'approved') return 'hatch-info';
  if (iv.status === 'rejected') return 'hatch-neutral';
  return 'hatch-warning';
}

/** Two lanes: recorded attendance (solid) and raw agent observations (hatched). */
export function TimelineBar({ intervals, now, dayStart = 6 * 3600, dayEnd = 19 * 3600, compact, showAxis = true, onSelect, selectedId }: TimelineBarProps) {
  const span = dayEnd - dayStart;
  const pos = (sec: number) => `${Math.min(100, Math.max(0, (sec - dayStart) / span * 100))}%`;
  const width = (a: number, b: number) => `${Math.max(0.6, (Math.min(b, dayEnd) - Math.max(a, dayStart)) / span * 100)}%`;
  const main = intervals.filter((i) => i.type !== 'idle');
  const idle = intervals.filter((i) => i.type === 'idle');
  const ticks: number[] = [];
  for (let t = Math.ceil(dayStart / 7200) * 7200; t <= dayEnd; t += 7200) ticks.push(t);
  const nowVisible = now > dayStart && now < dayEnd;

  const seg = (iv: Interval, cls: string, lane: string) => {
    const end = iv.endSec ?? now;
    const label = `${iv.type === 'work' ? 'Work' : iv.type === 'break' ? iv.breakCategory ?? 'Break' : 'Idle observation'} ${range(iv.startSec, iv.endSec)} · ${fmtDur(end - iv.startSec)}`;
    const Tag = onSelect ? 'button' : 'span';
    return (
      <Tag
        key={iv.id}
        title={label}
        aria-label={label}
        onClick={onSelect ? () => onSelect(iv) : undefined}
        className={twMerge('absolute rounded-[3px]', lane, cls, onSelect && 'cursor-pointer hover:brightness-95', selectedId === iv.id && 'ring-2 ring-ink ring-offset-1')}
        style={{ left: pos(iv.startSec), width: width(iv.startSec, end) }} />);


  };

  return (
    <div className="w-full">
      <div className={twMerge('relative w-full rounded-md bg-hover', compact ? 'h-5' : 'h-9')}>
        {main.map((iv) =>
        seg(iv, iv.type === 'work' ? iv.endSec === undefined ? 'bg-primary/80' : 'bg-primary' : 'bg-teal', compact ? 'top-0.5 h-2.5' : 'top-1 h-4')
        )}
        {idle.map((iv) => seg(iv, twMerge(idleClass(iv), 'border border-warning-fill/50'), compact ? 'bottom-0.5 h-1.5' : 'bottom-1 h-2.5'))}
        {nowVisible && <span aria-hidden className="absolute -top-1 bottom-[-4px] w-px bg-danger" style={{ left: pos(now) }} />}
      </div>
      {showAxis && !compact &&
      <div className="relative mt-1 h-4 text-[10px] text-subtle tnum">
          {ticks.map((t) =>
        <span key={t} className="absolute -translate-x-1/2" style={{ left: pos(t) }}>
              {secToLabel(t)}
            </span>
        )}
        </div>
      }
    </div>);

}