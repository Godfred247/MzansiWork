import React from 'react';
import { ActivityIcon, BellIcon, CalendarDaysIcon, ListChecksIcon, PlaneIcon, ShieldCheckIcon, SunIcon, UserIcon } from 'lucide-react';
import type { EmployeeScreen } from '../../types/nav';

const map: Partial<Record<EmployeeScreen, React.ElementType>> = {
  day: SunIcon,
  timesheets: CalendarDaysIcon,
  activity: ActivityIcon,
  leave: PlaneIcon,
  tasks: ListChecksIcon,
  notifications: BellIcon,
  profile: UserIcon,
  policy: ShieldCheckIcon
};

export function EmployeeNavIcon({ id, className }: {id: EmployeeScreen;className?: string;}) {
  const Icon = map[id] ?? SunIcon;
  return <Icon className={className} aria-hidden />;
}