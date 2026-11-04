import React from 'react';
import { ChevronLeftIcon } from 'lucide-react';
import { useDemo } from '../../contexts/DemoStore';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  large?: boolean;
  actions?: React.ReactNode;
  back?: boolean;
  onBack?: () => void;
}

export function MobileHeader({ title, subtitle, large, actions, back, onBack }: MobileHeaderProps) {
  const { state, dispatch } = useDemo();
  const canBack = back ?? state.employerStack.length > 1;
  const goBack = onBack ?? (() => dispatch({ type: 'EMPLOYER_BACK' }));
  const backBtn = canBack ?
  <button onClick={goBack} aria-label="Back" className="-ml-2 flex h-9 items-center gap-0.5 rounded-lg pl-1 pr-2 text-[15px] font-medium text-primary hover:bg-hover">
      <ChevronLeftIcon className="h-5 w-5" aria-hidden />
      Back
    </button> :
  null;

  if (large) {
    return (
      <header className="shrink-0 bg-surface px-4 pb-3 pt-1">
        <div className="flex h-9 items-center justify-between">
          <div>{backBtn}</div>
          <div className="flex items-center gap-1">{actions}</div>
        </div>
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
      </header>);

  }
  return (
    <header className="grid h-12 shrink-0 grid-cols-[88px_1fr_88px] items-center border-b border-line bg-surface px-4">
      <div>{backBtn}</div>
      <div className="min-w-0 text-center">
        <h1 className="truncate text-[15px] font-semibold text-ink">{title}</h1>
        {subtitle && <p className="truncate text-[11px] text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center justify-end gap-1">{actions}</div>
    </header>);

}