import { twMerge } from 'tailwind-merge';

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: {value: T;label: string;count?: number;}[];
  label: string;
  full?: boolean;
  tone?: 'light' | 'dark';
}

export function Segmented<T extends string>({ value, onChange, options, label, full, tone = 'light' }: SegmentedProps<T>) {
  return (
    <div role="tablist" aria-label={label} className={twMerge('inline-flex rounded-lg p-0.5', tone === 'light' ? 'bg-hover' : 'bg-white/10', full && 'flex w-full')}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={twMerge(
              'flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-colors duration-150',
              full && 'flex-1',
              tone === 'light' ?
              active ?
              'bg-surface text-ink shadow-card' :
              'text-muted hover:text-ink' :
              active ?
              'bg-white text-navy' :
              'text-navy-100 hover:text-white'
            )}>
            
            {o.label}
            {o.count !== undefined && o.count > 0 &&
            <span className={twMerge('tnum rounded-full px-1.5 text-[11px]', active ? 'bg-primary text-white' : 'bg-line text-muted')}>{o.count}</span>
            }
          </button>);

      })}
    </div>);

}