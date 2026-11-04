import React from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface MRowProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  chevron?: boolean;
  danger?: boolean;
  className?: string;
}

export function MRow({ leading, title, subtitle, trailing, onClick, chevron, danger, className }: MRowProps) {
  const content =
  <>
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className={twMerge('block truncate text-[14px] font-medium', danger ? 'text-danger-dark' : 'text-ink')}>{title}</span>
        {subtitle && <span className="mt-0.5 block truncate text-xs text-muted">{subtitle}</span>}
      </span>
      {trailing && <span className="flex shrink-0 items-center gap-1.5">{trailing}</span>}
      {(chevron ?? !!onClick) && <ChevronRightIcon className="h-4 w-4 shrink-0 text-subtle" aria-hidden />}
    </>;

  const cls = twMerge('flex w-full items-center gap-3 px-4 py-3 text-left', className);
  if (!onClick) return <div className={cls}>{content}</div>;
  return (
    <button onClick={onClick} className={twMerge(cls, 'transition-colors duration-150 active:bg-hover hover:bg-canvas')}>
      {content}
    </button>);

}