import React from 'react';
import { CalendarCheckIcon, InboxIcon, LayoutDashboardIcon, MoreHorizontalIcon, UsersIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDemo } from '../../contexts/DemoStore';
import type { EmployerScreen, EmployerTab } from '../../types/nav';
import { pendingCorrections, pendingLeave } from '../../utils/selectors';

const tabs: {id: EmployerTab;label: string;icon: React.ElementType;}[] = [
{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
{ id: 'attendance', label: 'Attendance', icon: CalendarCheckIcon },
{ id: 'employees', label: 'Employees', icon: UsersIcon },
{ id: 'approvals', label: 'Approvals', icon: InboxIcon },
{ id: 'more', label: 'More', icon: MoreHorizontalIcon }];


const tabOf: Partial<Record<EmployerScreen, EmployerTab>> = {
  'attendance-detail': 'attendance',
  employee: 'employees',
  invite: 'employees',
  seats: 'employees',
  correction: 'approvals',
  'leave-request': 'approvals'
};

export function BottomNav() {
  const { state, dispatch } = useDemo();
  const root = state.employerStack[0].name;
  const current = (tabs.find((t) => t.id === root)?.id ?? tabOf[root] ?? 'more') as EmployerTab;
  const badge = pendingCorrections(state, state.viewerRole).length + pendingLeave(state, state.viewerRole).length;

  return (
    <nav aria-label="Employer navigation" className="grid shrink-0 grid-cols-5 border-t border-line bg-surface/95 pb-5 pt-1.5">
      {tabs.map((t) => {
        const active = current === t.id;
        return (
          <button
            key={t.id}
            onClick={() => dispatch({ type: 'EMPLOYER_TAB', tab: t.id })}
            aria-current={active ? 'page' : undefined}
            className={twMerge('relative flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition-colors duration-150', active ? 'text-primary' : 'text-muted')}>
            
            <span className="relative">
              <t.icon className="h-[22px] w-[22px]" aria-hidden />
              {t.id === 'approvals' && badge > 0 &&
              <span className="tnum absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white" aria-label={`${badge} pending`}>
                  {badge}
                </span>
              }
            </span>
            {t.label}
          </button>);

      })}
    </nav>);

}