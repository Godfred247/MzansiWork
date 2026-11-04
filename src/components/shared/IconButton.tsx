import React from 'react';
import { twMerge } from 'tailwind-merge';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  badge?: number;
  tone?: 'light' | 'dark';
}

export function IconButton({ label, badge, tone = 'light', className, children, ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={badge ? `${label} (${badge} unread)` : label}
      title={label}
      className={twMerge(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ease-out disabled:opacity-40',
        tone === 'light' ? 'text-ink hover:bg-hover' : 'text-navy-100 hover:bg-white/10',
        className
      )}>
      
      {children}
      {badge ?
      <span className="tnum absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
          {badge > 9 ? '9+' : badge}
        </span> :
      null}
    </button>);

}