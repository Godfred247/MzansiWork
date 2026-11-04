import { ANNUAL_DISCOUNT, ENTERPRISE_MIN, ENTERPRISE_RATE, plans } from '../data/plans';
import type { Frequency, Plan, PlanId } from '../types/billing';

export function fmtZAR(n: number): string {
  const [int, dec] = n.toFixed(2).split('.');
  return `R${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${dec}`;
}

export function getPlan(id: PlanId): Plan {
  return plans.find((p) => p.id === id) as Plan;
}

export function enterpriseMonthly(users: number): number {
  return Math.max(ENTERPRISE_MIN, Math.round(users * ENTERPRISE_RATE * 100) / 100);
}

export function monthlyPrice(id: PlanId, users = 100): number {
  return id === 'enterprise' ? enterpriseMonthly(users) : getPlan(id).monthly;
}

export function annualPrice(id: PlanId, users = 100): number | null {
  if (id === 'starter') return null;
  if (id === 'enterprise') return Math.round(enterpriseMonthly(users) * 12 * (1 - ANNUAL_DISCOUNT) * 100) / 100;
  return getPlan(id).annual;
}

export function annualSaving(id: PlanId, users = 100): number {
  const a = annualPrice(id, users);
  return a === null ? 0 : Math.round((monthlyPrice(id, users) * 12 - a) * 100) / 100;
}

export function priceFor(id: PlanId, freq: Frequency, users = 100): number {
  return freq === 'annual' ? annualPrice(id, users) ?? monthlyPrice(id, users) : monthlyPrice(id, users);
}

export function planLimit(id: PlanId, users = 100): number {
  return id === 'enterprise' ? users : getPlan(id).maxUsers as number;
}

export function planRank(id: PlanId): number {
  return plans.findIndex((p) => p.id === id);
}

export function userRange(p: Plan): string {
  if (p.maxUsers === null) return `${p.minUsers}+ users`;
  if (p.id === 'starter') return `Up to ${p.maxUsers} users`;
  return `${p.minUsers}–${p.maxUsers} users`;
}

/** Prorated difference for an immediate monthly upgrade (days remaining in a 30-day period). */
export function proration(currentMonthly: number, newMonthly: number, daysLeft: number, periodDays = 30): number {
  return Math.max(0, Math.round((newMonthly - currentMonthly) * daysLeft * 100 / periodDays) / 100);
}