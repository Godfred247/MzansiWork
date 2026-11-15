import { leaveTypeName } from '../data/statusLabels';
import type { DemoState } from '../types/demo';
import type { LeaveOpening, LeavePolicy, LeaveRequest } from '../types/time';
import { johannesburgNow } from './time';
import { isLiveOrg } from './workspace';

export interface ShownBalance {
  code: string;
  name: string;
  available: number | null;
  used: number;
  granted: number | null;
  note: string;
  badge: string;
  next: string;
}

const round = (value: number) => Math.round(value * 100) / 100;

function utc(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year || 1970, (month || 1) - 1, day || 1));
}

function isoOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, last)));
}

function dayBefore(iso: string): string {
  const date = utc(iso);
  date.setUTCDate(date.getUTCDate() - 1);
  return isoOf(date);
}

export function formatDays(value: number): string {
  const days = round(value);
  const text = Number.isInteger(days) ? String(days) : days.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
  return `${text} day${days === 1 ? '' : 's'}`;
}

export function leaveCode(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return slug || 'leave';
}

export function starterPolicies(today = johannesburgNow().iso): LeavePolicy[] {
  const start = `${today.slice(0, 4)}-01-01`;
  const row = (code: string, name: string, note: string, sort: number): LeavePolicy => ({
    id: crypto.randomUUID(),
    code,
    name,
    enabled: true,
    tracksDays: true,
    grant: 'upfront',
    allowanceDays: null,
    monthlyDays: null,
    cycle: 'year',
    cycleStart: start,
    appliesTo: 'Everyone',
    note,
    sort
  });
  return [
    row('annual', 'Annual leave', 'The number of days your organisation allows. This is not a statutory balance.', 0),
    row('sick', 'Sick leave', 'Set the days and the cycle your organisation uses.', 1),
    row('family', 'Family responsibility leave', 'Say who qualifies. The product does not decide eligibility.', 2)
  ];
}

export function cycleBounds(policy: LeavePolicy, today: string): { start: string; endExclusive: string } {
  const months = policy.cycle === 'months36' ? 36 : policy.cycle === 'year' ? 12 : 0;
  const anchor = utc(policy.cycleStart);
  if (months === 0) return { start: policy.cycleStart, endExclusive: '9999-12-31' };
  if (utc(today) < anchor) return { start: policy.cycleStart, endExclusive: isoOf(addMonths(anchor, months)) };
  let start = anchor;
  while (addMonths(start, months) <= utc(today)) start = addMonths(start, months);
  return { start: isoOf(start), endExclusive: isoOf(addMonths(start, months)) };
}

function monthEnds(start: string, endExclusive: string, today: string, afterExclusive: string): number {
  const startDate = utc(start);
  const end = utc(endExclusive);
  const todayDate = utc(today);
  const after = utc(afterExclusive);
  let count = 0;
  let year = startDate.getUTCFullYear();
  let month = startDate.getUTCMonth();
  for (let guard = 0; guard < 48; guard += 1) {
    const last = new Date(Date.UTC(year, month + 1, 0));
    if (last >= end) break;
    if (last >= startDate && last <= todayDate && last > after) count += 1;
    month += 1;
    if (month === 12) {
      month = 0;
      year += 1;
    }
  }
  return count;
}

function nextMonthEnd(today: string, endExclusive: string): string | null {
  const todayDate = utc(today);
  const end = utc(endExclusive);
  let year = todayDate.getUTCFullYear();
  let month = todayDate.getUTCMonth();
  for (let guard = 0; guard < 18; guard += 1) {
    const last = new Date(Date.UTC(year, month + 1, 0));
    if (last >= end) return null;
    if (last > todayDate) return isoOf(last);
    month += 1;
    if (month === 12) {
      month = 0;
      year += 1;
    }
  }
  return null;
}

export function grantSummary(policy: LeavePolicy): string {
  if (!policy.tracksDays || policy.grant === 'none') return 'No running balance';
  if (policy.grant === 'monthly') {
    if (policy.monthlyDays == null) return 'Month-end amount not set';
    const cap = policy.allowanceDays == null ? '' : `, up to ${formatDays(policy.allowanceDays)} in the cycle`;
    return `Adds ${formatDays(policy.monthlyDays)} on the last day of each month${cap}`;
  }
  if (policy.allowanceDays == null) return 'Days not set yet';
  const cycle = policy.cycle === 'months36' ? 'every 36 months' : policy.cycle === 'year' ? 'each year' : 'for this type';
  return `${formatDays(policy.allowanceDays)} ${cycle}`;
}

export function balanceFor(policy: LeavePolicy, leave: LeaveRequest[], opening: LeaveOpening | undefined, memberId: string, today: string): ShownBalance {
  const name = policy.name || leaveTypeName(policy.code);
  const bounds = cycleBounds(policy, today);
  const tracked = policy.tracksDays && policy.grant !== 'none';
  const openingApplies = tracked && opening && opening.asOf >= bounds.start && opening.asOf <= today;
  const used = round(leave.filter((item) => item.memberId === memberId && item.type === policy.code && item.status === 'approved' && item.start >= bounds.start && item.start < bounds.endExclusive && (!openingApplies || item.start > opening.asOf)).reduce((sum, item) => sum + item.days, 0));
  let granted: number | null = null;
  if (tracked && policy.grant === 'upfront') granted = openingApplies ? opening.openingDays : policy.allowanceDays;
  if (tracked && policy.grant === 'monthly' && policy.monthlyDays != null) {
    const after = openingApplies ? opening.asOf : dayBefore(bounds.start);
    const base = openingApplies ? opening.openingDays : 0;
    granted = round(base + monthEnds(bounds.start, bounds.endExclusive, today, after) * policy.monthlyDays);
    if (policy.allowanceDays != null) granted = Math.min(granted, policy.allowanceDays);
  }
  const available = granted == null ? null : round(granted - used);
  let next = '';
  if (policy.grant === 'monthly' && policy.monthlyDays != null && granted != null) {
    const when = nextMonthEnd(today, bounds.endExclusive);
    const room = policy.allowanceDays == null ? policy.monthlyDays : round(policy.allowanceDays - granted);
    const amount = round(Math.min(policy.monthlyDays, room));
    if (when && amount > 0) next = `Next ${formatDays(amount)} on ${when}`;
    else if (policy.allowanceDays != null && granted >= policy.allowanceDays) next = 'The cycle limit has been reached.';
  }
  const badge = policy.grant === 'monthly' ? 'Added at month end' : policy.grant === 'upfront' ? 'Given at the start of the cycle' : 'No day count';
  return { code: policy.code, name, available, used, granted, note: policy.note, badge, next };
}

export function shownBalances(state: Pick<DemoState, 'orgId' | 'flow' | 'leavePolicies' | 'leaveOpenings' | 'leave' | 'balances'>, memberId: string, today = johannesburgNow().iso): ShownBalance[] {
  const policies = state.leavePolicies ?? [];
  if (!isLiveOrg(state.orgId) || state.flow || policies.length === 0) {
    return state.balances.map((balance) => ({
      code: balance.type,
      name: leaveTypeName(balance.type).replace(' (employer benefit)', ''),
      available: balance.available,
      used: balance.used,
      granted: balance.available == null ? null : round(balance.available + balance.used),
      note: balance.note,
      badge: balance.basis === 'statutory' ? 'Statutory minimum + policy' : balance.basis === 'verify' ? 'Awaiting HR verification' : 'Employer benefit',
      next: ''
    }));
  }
  return [...policies].filter((policy) => policy.enabled).sort((a, b) => a.sort - b.sort).map((policy) => balanceFor(policy, state.leave, state.leaveOpenings.find((opening) => opening.policyId === policy.id && opening.userId === memberId), memberId, today));
}

export function labelLeave(policies: LeavePolicy[] | undefined, type: string): string {
  return policies?.find((policy) => policy.code === type)?.name ?? leaveTypeName(type);
}
