import type { Plan } from '../types/billing';

export const PRICING_NOTE = 'Proposed pricing — configurable values pending commercial validation.';
export const ANNUAL_DISCOUNT = 0.1;
export const ENTERPRISE_RATE = 2.7;
export const ENTERPRISE_MIN = 270;
export const GRACE_DAYS = 7;

export const plans: Plan[] = [
{ id: 'starter', name: 'Starter', minUsers: 1, maxUsers: 5, monthly: 89, annual: null, blurb: 'For very small teams. Monthly billing only.' },
{ id: 'small', name: 'Small Business', minUsers: 6, maxUsers: 19, monthly: 119.99, annual: 1295.89, blurb: 'For growing teams of 6–19 people.' },
{ id: 'medium', name: 'Medium Business', minUsers: 20, maxUsers: 39, monthly: 179.99, annual: 1943.89, blurb: 'For teams of 20–39 people.' },
{ id: 'large', name: 'Large Business', minUsers: 40, maxUsers: 99, monthly: 229.99, annual: 2483.89, blurb: 'For organisations of 40–99 people.' },
{ id: 'enterprise', name: 'Enterprise', minUsers: 100, maxUsers: null, monthly: 270, annual: null, perUser: 2.7, blurb: 'R2.70 per user per month, minimum R270.' }];


export const coreFeatures = [
'Clock in/out, tasks and breaks',
'Timesheets with correction workflow',
'Leave requests and approvals',
'Optional Windows desktop agent',
'Reports with CSV, Excel and PDF export',
'Audit history'];


export const midTermSeatRule =
'Seats added during an annual term are billed pro rata on the next invoice. Placeholder rule — to be confirmed in final commercial terms.';