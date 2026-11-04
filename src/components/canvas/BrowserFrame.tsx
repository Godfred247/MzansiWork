import React from 'react';
import { LockIcon, MonitorIcon, RotateCwIcon, SmartphoneIcon, TabletIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDemo } from '../../contexts/DemoStore';
import { EmployeeLayoutProvider } from '../../contexts/EmployeeLayout';
import { useElementWidth } from '../../hooks/useElementWidth';
import type { EmployeeViewport } from '../../types/demo';

const paths: Record<string, string> = {
  signin: '/sign-in',
  invite: '/invite/accept?token=•••',
  setup: '/invite/setup',
  reset: '/reset-password',
  day: '/my-day',
  timesheets: '/timesheets',
  activity: '/activity',
  leave: '/leave',
  tasks: '/tasks',
  notifications: '/notifications',
  profile: '/profile',
  policy: '/tracking-policy'
};

const viewports: {id: EmployeeViewport;label: string;icon: React.ElementType;}[] = [
{ id: 'fit', label: 'Desktop (fit frame)', icon: MonitorIcon },
{ id: 'tablet', label: 'Tablet 768px', icon: TabletIcon },
{ id: 'mobile', label: 'Mobile 390px', icon: SmartphoneIcon }];


export function BrowserFrame({ children, highlight }: {children: React.ReactNode;highlight?: boolean;}) {
  const { state, dispatch } = useDemo();
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const r = state.employeeRoute;
  const path = r.name === 'denied' ? r.params?.path ?? '/employer' : paths[r.name];
  const vp = state.employeeViewport;
  const innerWidth = vp === 'fit' ? width : vp === 'tablet' ? Math.min(768, width) : Math.min(390, width);

  return (
    <div className={twMerge('flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#CBD5E1] bg-surface shadow-frame transition-shadow duration-200', highlight && 'ring-4 ring-primary/40')}>
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-line bg-[#F1F5F9] px-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#F87171]" />
          <span className="h-3 w-3 rounded-full bg-[#FBBF24]" />
          <span className="h-3 w-3 rounded-full bg-[#4ADE80]" />
        </div>
        <RotateCwIcon className="h-3.5 w-3.5 text-muted" aria-hidden />
        <div className="flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-md bg-surface px-2.5 text-xs text-muted ring-1 ring-line">
          <LockIcon className="h-3 w-3 shrink-0 text-success" aria-hidden />
          <span className="truncate">
            <span className="text-ink">app.mzansiwork.co.za</span>
            {path}
          </span>
        </div>
        <div className="flex items-center gap-0.5 rounded-md bg-surface p-0.5 ring-1 ring-line" role="group" aria-label="Preview width">
          {viewports.map((v) =>
          <button
            key={v.id}
            onClick={() => dispatch({ type: 'EMPLOYEE_VIEWPORT', viewport: v.id })}
            aria-label={v.label}
            aria-pressed={vp === v.id}
            title={v.label}
            className={twMerge('rounded p-1 transition-colors duration-150', vp === v.id ? 'bg-primary-soft text-primary' : 'text-muted hover:text-ink')}>
            
              <v.icon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div ref={ref} className={twMerge('relative flex min-h-0 flex-1 justify-center', vp !== 'fit' && 'bg-[#E2E8F0]')}>
        <div className={twMerge('relative flex min-h-0 flex-col overflow-hidden bg-canvas', vp !== 'fit' && 'border-x border-[#CBD5E1]')} style={{ width: innerWidth || '100%' }}>
          <EmployeeLayoutProvider width={innerWidth}>{children}</EmployeeLayoutProvider>
        </div>
      </div>
    </div>);

}