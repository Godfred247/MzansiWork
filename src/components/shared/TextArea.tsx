import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function TextArea({ invalid, className, ...rest }: TextAreaProps) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={twMerge(
        'min-h-[84px] w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-subtle transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
        invalid ? 'border-danger' : 'border-line',
        className
      )} />);


}