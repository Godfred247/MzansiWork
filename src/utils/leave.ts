import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns';
import { publicHolidays } from '../data/holidays';

export interface LeaveBreakdown {
  calendarDays: number;
  working: number;
  weekends: number;
  holidays: {date: string;name: string;}[];
}

export function leaveBreakdown(start: string, end: string, portion: 'full' | 'morning' | 'afternoon'): LeaveBreakdown | null {
  if (!start || !end || end < start) return null;
  const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
  let working = 0;
  let weekends = 0;
  const holidays: {date: string;name: string;}[] = [];
  days.forEach((d) => {
    const iso = format(d, 'yyyy-MM-dd');
    const hol = publicHolidays.find((h) => h.date === iso);
    if (isWeekend(d)) weekends++;else
    if (hol) holidays.push(hol);else
    working++;
  });
  const total = portion !== 'full' && days.length === 1 ? working * 0.5 : working;
  return { calendarDays: days.length, working: total, weekends, holidays };
}

export function overlaps(a: {start: string;end: string;}, b: {start: string;end: string;}): boolean {
  return a.start <= b.end && b.start <= a.end;
}