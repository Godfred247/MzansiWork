import type { SeatUsage } from '../../utils/seats';

export function SeatMeter({ usage, showFormula = true }: {usage: SeatUsage;showFormula?: boolean;}) {
  const pct = (n: number) => `${n / Math.max(usage.limit, 1) * 100}%`;
  return (
    <div>
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-hover"
        role="img"
        aria-label={`${usage.active} active, ${usage.reserved} reserved, ${usage.available} available of ${usage.limit} seats`}>
        
        <span className="h-full bg-primary" style={{ width: pct(usage.active) }} />
        <span className="hatch-warning h-full" style={{ width: pct(usage.reserved) }} />
      </div>
      <dl className="mt-2.5 grid grid-cols-3 gap-2 text-[12px]">
        <div>
          <dt className="flex items-center gap-1.5 text-muted"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden />Active</dt>
          <dd className="tnum text-sm font-semibold text-ink">{usage.active}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-muted"><span className="hatch-warning h-2 w-2 rounded-full" aria-hidden />Reserved</dt>
          <dd className="tnum text-sm font-semibold text-ink">{usage.reserved}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-muted"><span className="h-2 w-2 rounded-full border border-line bg-surface" aria-hidden />Available</dt>
          <dd className={`tnum text-sm font-semibold ${usage.available === 0 ? 'text-danger-dark' : 'text-ink'}`}>{usage.available}</dd>
        </div>
      </dl>
      {showFormula &&
      <p className="tnum mt-2 rounded-md bg-hover px-2.5 py-1.5 text-[11px] text-muted">
          {usage.limit} included − {usage.active} active − {usage.reserved} pending = <strong className="text-ink">{usage.available} available</strong>
        </p>
      }
    </div>);

}