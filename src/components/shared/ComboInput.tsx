import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ComboInputProps {
  id?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onCreate?: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  invalid?: boolean;
}

export function ComboInput({ id, value, options, onChange, onCreate, placeholder, ariaLabel, invalid }: ComboInputProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const query = value.trim().toLowerCase();
  const matches = options.filter((option) => option.toLowerCase().includes(query));
  const exact = options.some((option) => option.toLowerCase() === query);
  const canCreate = query.length > 0 && !exact;
  const rows = canCreate ? [...matches, value.trim()] : matches;

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const choose = (next: string, create: boolean) => {
    const clean = next.trim();
    if (!clean) return;
    if (create) onCreate?.(clean);
    onChange(clean);
    setOpen(false);
  };

  return (
    <div ref={root} className="relative">
      <input
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
        value={value}
        placeholder={placeholder}
        onFocus={() => { setOpen(true); setActive(0); }}
        onChange={(event) => { onChange(event.target.value); setOpen(true); setActive(0); }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActive((index) => Math.min(index + 1, Math.max(rows.length - 1, 0)));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
          } else if (event.key === 'Enter' && open && rows[active]) {
            event.preventDefault();
            choose(rows[active], canCreate && active === rows.length - 1);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={twMerge(
          'h-10 w-full rounded-lg border bg-surface pl-3 pr-9 text-sm text-ink placeholder:text-subtle transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          invalid ? 'border-danger' : 'border-line'
        )} />
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      {open && rows.length > 0 &&
      <ul id={listId} role="listbox" className="absolute left-0 right-0 top-11 z-30 max-h-40 overflow-y-auto rounded-lg border border-line bg-surface py-1 shadow-card">
          {matches.map((option, index) =>
          <li key={option} role="option" aria-selected={value === option}>
              <button
                type="button"
                className={twMerge('block w-full truncate px-3 py-2 text-left text-sm text-ink hover:bg-hover', active === index && 'bg-hover')}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option, false)}>
                {option}
              </button>
            </li>
          )}
          {canCreate &&
          <li role="option" aria-selected={false}>
              <button
                type="button"
                className={twMerge('block w-full truncate px-3 py-2 text-left text-sm font-medium text-primary hover:bg-hover', active === rows.length - 1 && 'bg-hover')}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(value.trim(), true)}>
                Add “{value.trim()}”
              </button>
            </li>
          }
        </ul>
      }
    </div>);
}
