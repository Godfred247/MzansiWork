import React from 'react';
import { twMerge } from 'tailwind-merge';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  body: string;
  action?: React.ReactNode;
  tone?: 'neutral' | 'danger' | 'success';
  className?: string;
}

export function EmptyState({ icon: Icon, title, body, action, tone = 'neutral', className }: EmptyStateProps) {
  return (
    <div className={twMerge('flex flex-col items-center px-6 py-10 text-center', className)}>
      <span
        className={twMerge(
          'mb-3 flex h-11 w-11 items-center justify-center rounded-full',
          tone === 'danger' ? 'bg-danger-soft text-danger' : tone === 'success' ? 'bg-success-soft text-success' : 'bg-hover text-muted'
        )}>
        
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>);

}