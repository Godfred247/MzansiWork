/** Organisation-wide recorded hours for the week (demo values; today is live). */
export const weeklyHours = [
{ day: 'Mon 19', hours: 104.5 },
{ day: 'Tue 20', hours: 108.2 },
{ day: 'Wed 21', hours: 101.7 },
{ day: 'Thu 22', hours: 106.9 },
{ day: 'Fri 23', hours: 96.3 }];


/** Weekly attendance totals per member (week 43, hours) for the attendance week view. */
export const memberWeek: Record<string, {hours: number[];approved: boolean;}> = {
  'm-lerato': { hours: [8.6, 8.9, 8.1, 9.2, 7.8], approved: true },
  'm-pieter': { hours: [8.3, 8.2, 8.4, 8.1, 7.6], approved: true },
  'm-thandi': { hours: [8.3, 8.1, 8.3, 8.0, 7.5], approved: false },
  'm-sipho': { hours: [8.0, 8.1, 7.9, 8.2, 8.7], approved: false },
  'm-aisha': { hours: [7.9, 8.0, 8.1, 7.6, 7.8], approved: true },
  'm-johan': { hours: [8.1, 8.4, 8.0, 8.3, 7.9], approved: false },
  'm-nomsa': { hours: [7.8, 7.9, 8.0, 7.7, 7.5], approved: true },
  'm-kagiso': { hours: [7.9, 8.2, 7.4, 8.0, 7.6], approved: true },
  'm-fatima': { hours: [7.5, 7.8, 0, 7.9, 7.7], approved: true },
  'm-ruan': { hours: [8.1, 8.0, 8.2, 8.0, 0], approved: true },
  'm-zanele': { hours: [8.2, 8.0, 8.1, 8.3, 7.9], approved: true },
  'm-david': { hours: [8.0, 8.1, 7.9, 8.0, 7.6], approved: true },
  'm-lindiwe': { hours: [8.0, 7.9, 8.2, 8.1, 7.4], approved: true },
  'm-michael': { hours: [8.4, 8.6, 8.1, 8.0, 6.2], approved: true },
  'm-busi': { hours: [0, 8.0, 8.1, 7.9, 8.2], approved: true }
};

export const annualBalances: Record<string, number> = {
  'm-lerato': 14, 'm-pieter': 9.5, 'm-thandi': 11.5, 'm-sipho': 7, 'm-aisha': 12, 'm-johan': 4.5, 'm-nomsa': 10,
  'm-kagiso': 13, 'm-fatima': 15, 'm-ruan': 6, 'm-zanele': 8.5, 'm-david': 3, 'm-lindiwe': 13.5, 'm-michael': 9, 'm-busi': 11
};

export const invoices = [
{ id: 'INV-2026-010', date: '2026-10-14', amount: 119.99, status: 'Paid' },
{ id: 'INV-2026-009', date: '2026-09-14', amount: 119.99, status: 'Paid' },
{ id: 'INV-2026-008', date: '2026-08-14', amount: 119.99, status: 'Paid' }];