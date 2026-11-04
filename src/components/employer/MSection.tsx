import React from 'react';
import { twMerge } from 'tailwind-merge';

interface MSectionProps {
  title?: string;
  action?: React.ReactNode;
  footer?: string;
  children: React.ReactNode;
  className?: string;
  flush?: boolean;
}

/** Inset grouped list, the standard mobile grouping pattern. */
export function MSection({ title, action, footer, children, className, flush }: MSectionProps) {
  return (
    <section className={className}>
      {(title || action) &&
      <div className="mb-1.5 flex items-end justify-between px-1">
          {title && <h2 className="text-[13px] font-semibold text-muted">{title}</h2>}
          {action}
        </div>
      }
      <div className={twMerge('overflow-hidden rounded-2xl bg-surface shadow-card', !flush && 'divide-y divide-line')}>{children}</div>
      {footer && <p className="mt-1.5 px-1 text-xs leading-relaxed text-muted">{footer}</p>}
    </section>);

}