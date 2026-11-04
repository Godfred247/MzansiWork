import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leading?: React.ReactNode;
}

export function TextInput({ invalid, leading, className, id, ...rest }: TextInputProps) {
  return (
    <div className="relative">
      {leading && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{leading}</span>}
      <input
        id={id}
        {...rest}
        aria-invalid={invalid || undefined}
        aria-describedby={id ? invalid ? `${id}-error` : `${id}-hint` : undefined}
        className={twMerge(
          'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-subtle transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-hover disabled:text-muted',
          invalid ? 'border-danger' : 'border-line',
          leading && 'pl-9',
          className
        )} />
      
    </div>);

}