import { addDays as addDaysFns, format, parseISO } from 'date-fns';

export const TODAY = '2026-10-26';

/** Current date and time of day in South African Standard Time. */
export function johannesburgNow(date = new Date()): { iso: string; sec: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '00';
  const hour = Number(get('hour'));
  return {
    iso: `${get('year')}-${get('month')}-${get('day')}`,
    sec: hour * 3600 + Number(get('minute')) * 60 + Number(get('second'))
  };
}

export const pad = (n: number) => String(n).padStart(2, '0');

export function secToLabel(sec: number): string {
  const s = (Math.floor(sec) % 86400 + 86400) % 86400;
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}`;
}

export function labelToSec(label: string): number {
  const [h, m] = label.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60;
}

export function fmtDur(sec: number): string {
  const m = Math.max(0, Math.round(sec / 60));
  const h = Math.floor(m / 60);
  return h ? `${h}h ${pad(m % 60)}m` : `${m}m`;
}

export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`;
}

export function fmtHours(sec: number): string {
  return (sec / 3600).toFixed(2);
}

export function fmtDate(iso: string, pattern = 'EEE d MMM yyyy'): string {
  return format(parseISO(iso), pattern);
}

export function addDays(iso: string, n: number): string {
  return format(addDaysFns(parseISO(iso), n), 'yyyy-MM-dd');
}

export function range(start: number, end?: number): string {
  return `${secToLabel(start)}–${end === undefined ? 'now' : secToLabel(end)}`;
}