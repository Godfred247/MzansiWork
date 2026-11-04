import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: {value: string;label: string;}[];
  invalid?: boolean;
}

export function SelectInput({ options, invalid, className, ...rest }: SelectInputProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        aria-invalid={invalid || undefined}
        className={twMerge(
          'h-10 w-full appearance-none rounded-lg border bg-surface pl-3 pr-9 text-sm text-ink transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-hover disabled:text-muted',
          invalid ? 'border-danger' : 'border-line',
          className
        )}>
        
        {options.map((o) =>
        <option key={o.value} value={o.value}>
            {o.label}
          </option>
        )}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>);

}