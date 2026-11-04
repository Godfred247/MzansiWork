import React from 'react';
import { BatteryFullIcon, SignalIcon, WifiIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useClock } from '../../contexts/DemoStore';
import { secToLabel } from '../../utils/time';

export function PhoneFrame({ children, highlight }: {children: React.ReactNode;highlight?: boolean;}) {
  const clock = useClock();
  return (
    <div
      className={twMerge(
        'flex h-full max-h-[844px] min-h-[600px] w-[384px] shrink-0 rounded-[48px] bg-ink p-[10px] shadow-frame transition-shadow duration-200',
        highlight && 'ring-4 ring-primary/40'
      )}>
      
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[38px] bg-canvas">
        <div className="flex h-11 shrink-0 items-center justify-between bg-surface px-7 text-[13px] font-semibold text-ink" aria-hidden>
          <span className="tnum">{secToLabel(clock)}</span>
          <span className="absolute left-1/2 top-2.5 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
          <span className="flex items-center gap-1">
            <SignalIcon className="h-3.5 w-3.5" />
            <WifiIcon className="h-3.5 w-3.5" />
            <BatteryFullIcon className="h-4 w-4" />
          </span>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-[70] h-1 w-28 -translate-x-1/2 rounded-full bg-ink/80" aria-hidden />
      </div>
    </div>);

}