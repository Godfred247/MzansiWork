import type { ExportJob } from '../types/billing';
import type { AppNotification, AuditEntry } from '../types/org';
import type { Correction, Interval, LeaveBalance, LeaveRequest, TimeEvent } from '../types/time';

const h = (hh: number, mm = 0) => hh * 3600 + mm * 60;
const T = 'm-thandi';

export const seedIntervals: Interval[] = [
// Thandi — Mon 19 Oct
{ id: 'iv-t19-w1', memberId: T, date: '2026-10-19', type: 'work', startSec: h(8, 1), endSec: h(12, 30), projectId: 'p-shoprite', taskId: 't-research', status: 'approved', source: 'browser' },
{ id: 'iv-t19-b1', memberId: T, date: '2026-10-19', type: 'break', startSec: h(12, 30), endSec: h(13, 15), breakCategory: 'Lunch break', status: 'approved', source: 'browser' },
{ id: 'iv-t19-w2', memberId: T, date: '2026-10-19', type: 'work', startSec: h(13, 15), endSec: h(17, 4), projectId: 'p-shoprite', taskId: 't-checkout', status: 'approved', source: 'browser' },
// Tue 20 Oct
{ id: 'iv-t20-w1', memberId: T, date: '2026-10-20', type: 'work', startSec: h(7, 58), endSec: h(10, 30), projectId: 'p-shoprite', taskId: 't-checkout', status: 'approved', source: 'browser' },
{ id: 'iv-t20-b1', memberId: T, date: '2026-10-20', type: 'break', startSec: h(10, 30), endSec: h(10, 45), breakCategory: 'Tea break', status: 'approved', source: 'browser' },
{ id: 'iv-t20-w2', memberId: T, date: '2026-10-20', type: 'work', startSec: h(10, 45), endSec: h(12, 45), projectId: 'p-website', taskId: 't-ia', status: 'approved', source: 'browser' },
{ id: 'iv-t20-b2', memberId: T, date: '2026-10-20', type: 'break', startSec: h(12, 45), endSec: h(13, 30), breakCategory: 'Lunch break', status: 'approved', source: 'browser' },
{ id: 'iv-t20-w3', memberId: T, date: '2026-10-20', type: 'work', startSec: h(13, 30), endSec: h(17, 0), projectId: 'p-website', taskId: 't-ia', status: 'approved', source: 'browser' },
// Wed 21 Oct
{ id: 'iv-t21-w1', memberId: T, date: '2026-10-21', type: 'work', startSec: h(8, 5), endSec: h(12, 30), projectId: 'p-shoprite', taskId: 't-checkout', status: 'approved', source: 'browser' },
{ id: 'iv-t21-b1', memberId: T, date: '2026-10-21', type: 'break', startSec: h(12, 30), endSec: h(13, 10), breakCategory: 'Lunch break', status: 'approved', source: 'browser' },
{ id: 'iv-t21-w2', memberId: T, date: '2026-10-21', type: 'work', startSec: h(13, 10), endSec: h(17, 10), projectId: 'p-shoprite', taskId: 't-checkout', status: 'approved', source: 'browser' },
// Thu 22 Oct (approved idle → telephone call)
{ id: 'iv-t22-w1', memberId: T, date: '2026-10-22', type: 'work', startSec: h(8, 0), endSec: h(12, 30), projectId: 'p-shoprite', taskId: 't-research', status: 'approved', source: 'browser' },
{ id: 'iv-t22-b1', memberId: T, date: '2026-10-22', type: 'break', startSec: h(12, 30), endSec: h(13, 15), breakCategory: 'Lunch break', status: 'approved', source: 'browser' },
{ id: 'iv-t22-w2', memberId: T, date: '2026-10-22', type: 'work', startSec: h(13, 15), endSec: h(17, 0), projectId: 'p-shoprite', taskId: 't-research', status: 'approved', source: 'browser' },
{ id: 'iv-t22-idle', memberId: T, date: '2026-10-22', type: 'idle', startSec: h(14, 0), endSec: h(14, 40), status: 'approved', classification: 'Telephone call', source: 'agent', correctionId: 'c-thandi-22' },
// Fri 23 Oct (unclassified idle, day submitted)
{ id: 'iv-t23-w1', memberId: T, date: '2026-10-23', type: 'work', startSec: h(8, 3), endSec: h(12, 20), projectId: 'p-website', taskId: 't-visual', status: 'recorded', source: 'browser' },
{ id: 'iv-t23-b1', memberId: T, date: '2026-10-23', type: 'break', startSec: h(12, 20), endSec: h(13, 0), breakCategory: 'Lunch break', status: 'recorded', source: 'browser' },
{ id: 'iv-t23-w2', memberId: T, date: '2026-10-23', type: 'work', startSec: h(13, 0), endSec: h(16, 45), projectId: 'p-website', taskId: 't-visual', status: 'recorded', source: 'browser' },
{ id: 'iv-t23-idle', memberId: T, date: '2026-10-23', type: 'idle', startSec: h(15, 10), endSec: h(15, 35), status: 'unclassified', source: 'agent' },
// Thandi — today (default demo state)
{ id: 'iv-t26-w1', memberId: T, date: '2026-10-26', type: 'work', startSec: h(8, 2), endSec: h(9, 45), projectId: 'p-shoprite', taskId: 't-checkout', category: 'Client work', status: 'recorded', source: 'browser' },
{ id: 'iv-t26-b1', memberId: T, date: '2026-10-26', type: 'break', startSec: h(9, 45), endSec: h(10, 0), breakCategory: 'Tea break', status: 'recorded', source: 'browser' },
{ id: 'iv-t26-w2', memberId: T, date: '2026-10-26', type: 'work', startSec: h(10, 0), projectId: 'p-shoprite', taskId: 't-checkout', category: 'Client work', status: 'recorded', source: 'browser' },
// Other employees — today
{ id: 'iv-j26-w1', memberId: 'm-johan', date: '2026-10-26', type: 'work', startSec: h(6, 58), projectId: 'p-shoprite', taskId: 't-api', status: 'recorded', source: 'browser' },
{ id: 'iv-j26-idle', memberId: 'm-johan', date: '2026-10-26', type: 'idle', startSec: h(9, 10), endSec: h(9, 40), status: 'unclassified', source: 'agent' },
{ id: 'iv-s26-w1', memberId: 'm-sipho', date: '2026-10-26', type: 'work', startSec: h(9, 24), projectId: 'p-shoprite', taskId: 't-checkout', status: 'recorded', source: 'browser' },
{ id: 'iv-a26-w1', memberId: 'm-aisha', date: '2026-10-26', type: 'work', startSec: h(8, 27), endSec: h(10, 15), projectId: 'p-onboarding', taskId: 't-kickoff', status: 'recorded', source: 'browser' },
{ id: 'iv-a26-b1', memberId: 'm-aisha', date: '2026-10-26', type: 'break', startSec: h(10, 15), breakCategory: 'Tea break', status: 'recorded', source: 'browser' },
{ id: 'iv-z26-w1', memberId: 'm-zanele', date: '2026-10-26', type: 'work', startSec: h(7, 22), projectId: 'p-onboarding', taskId: 't-support', status: 'recorded', source: 'browser' },
{ id: 'iv-m26-w1', memberId: 'm-michael', date: '2026-10-26', type: 'work', startSec: h(7, 30), endSec: h(10, 10), projectId: 'p-onboarding', taskId: 't-kickoff', status: 'recorded', source: 'browser' },
{ id: 'iv-r25-w1', memberId: 'm-ruan', date: '2026-10-25', type: 'work', startSec: h(21, 57), projectId: 'p-infra', taskId: 't-oncall', status: 'recorded', source: 'browser' }];


export const seedEvents: TimeEvent[] = [
{ id: 'ev-1', memberId: T, date: '2026-10-26', sec: h(8, 2), kind: 'clock_in', source: 'browser', detail: 'Clocked in · Shoprite Rewards App · Checkout redesign', synced: true },
{ id: 'ev-2', memberId: T, date: '2026-10-26', sec: h(8, 3), kind: 'sync', source: 'agent', detail: 'Desktop agent started tracking for this session', synced: true },
{ id: 'ev-3', memberId: T, date: '2026-10-26', sec: h(9, 45), kind: 'break_start', source: 'browser', detail: 'Tea break started', synced: true },
{ id: 'ev-4', memberId: T, date: '2026-10-26', sec: h(10, 0), kind: 'break_end', source: 'browser', detail: 'Tea break ended · 15m', synced: true },
{ id: 'ev-5', memberId: T, date: '2026-10-23', sec: h(15, 10), kind: 'idle_start', source: 'agent', detail: 'No input for 5 min (threshold reached)', synced: true },
{ id: 'ev-6', memberId: T, date: '2026-10-23', sec: h(15, 35), kind: 'active_resumed', source: 'agent', detail: 'Input resumed — active state', synced: true }];


export const seedCorrections: Correction[] = [
{
  id: 'c-zanele', memberId: 'm-zanele', date: '2026-10-26', kind: 'clock_in', original: 'Clock-in recorded at 07:22', requested: 'Clock-in at 06:55',
  reason: 'The portal would not load on my laptop at 06:55. I started on the support queue from my phone and clocked in once it loaded.',
  status: 'pending', source: 'browser', projectId: 'p-onboarding', durationSec: 1620,
  history: [
  { date: '2026-10-26', time: '07:31', actor: 'Zanele Mthembu', status: 'submitted' },
  { date: '2026-10-26', time: '07:31', actor: 'System', status: 'pending', note: 'Routed to Pieter van Wyk' }]

},
{
  id: 'c-sipho', memberId: 'm-sipho', date: '2026-10-23', kind: 'clock_out', original: 'No clock-out recorded (session left open)', requested: 'Clock-out at 17:40',
  reason: 'I forgot to clock out after the release call finished at 17:40.', status: 'pending', source: 'browser', projectId: 'p-shoprite',
  history: [{ date: '2026-10-24', time: '09:12', actor: 'Sipho Dlamini', status: 'submitted' }, { date: '2026-10-24', time: '09:12', actor: 'System', status: 'pending' }]
},
{
  id: 'c-thandi-22', memberId: T, date: '2026-10-22', kind: 'idle_classification', intervalId: 'iv-t22-idle', original: 'Idle 14:00–14:40 (desktop agent observation)',
  requested: 'Classify as work — Telephone call', classification: 'Telephone call', reason: 'Client call with Shoprite about the rewards checkout. I took it on my phone.',
  status: 'approved', source: 'browser', durationSec: 2400, reviewer: 'Pieter van Wyk', decisionReason: 'Matches the client call on the Shoprite calendar.', projectId: 'p-shoprite',
  history: [
  { date: '2026-10-22', time: '16:50', actor: 'Thandi Nkosi', status: 'submitted' },
  { date: '2026-10-22', time: '16:50', actor: 'System', status: 'pending' },
  { date: '2026-10-23', time: '08:40', actor: 'Pieter van Wyk', status: 'approved', note: 'Matches the client call on the Shoprite calendar.' }]

},
{
  id: 'c-johan', memberId: 'm-johan', date: '2026-10-21', kind: 'break', original: 'Lunch break 12:00–13:20 (80 min)', requested: 'Lunch 12:00–12:45, then work 12:45–13:20 (client call)',
  reason: 'I took a client call during the end of my lunch and forgot to end the break.', status: 'info_requested', source: 'browser',
  history: [
  { date: '2026-10-21', time: '16:02', actor: 'Johan Botha', status: 'submitted' },
  { date: '2026-10-22', time: '10:15', actor: 'Pieter van Wyk', status: 'info_requested', note: 'Which client was the call with? Please add the project.' }]

}];


export const seedLeave: LeaveRequest[] = [
{ id: 'l-aisha', memberId: 'm-aisha', type: 'annual', start: '2026-11-02', end: '2026-11-06', days: 5, portion: 'full', notes: 'Family trip to the Drakensberg.', status: 'pending', submitted: '2026-10-23' },
{ id: 'l-kagiso', memberId: 'm-kagiso', type: 'family', start: '2026-10-29', end: '2026-10-29', days: 1, portion: 'full', notes: 'Child is ill — needs care at home.', status: 'pending', submitted: '2026-10-26' },
{ id: 'l-david', memberId: 'm-david', type: 'annual', start: '2026-10-26', end: '2026-10-30', days: 5, portion: 'full', notes: '', status: 'approved', submitted: '2026-10-05', reviewer: 'Lerato Mokoena' },
{ id: 'l-fatima', memberId: 'm-fatima', type: 'unpaid', start: '2026-10-12', end: '2026-10-13', days: 2, portion: 'full', notes: 'Personal travel.', status: 'rejected', submitted: '2026-10-08', reviewer: 'Pieter van Wyk', decisionReason: 'Campaign launch week — please choose dates after 16 Oct.' },
{ id: 'l-thandi-sick', memberId: T, type: 'sick', start: '2026-10-08', end: '2026-10-08', days: 1, portion: 'full', notes: '', status: 'approved', submitted: '2026-10-08', reviewer: 'Pieter van Wyk' },
{ id: 'l-thandi-dec', memberId: T, type: 'annual', start: '2026-12-21', end: '2026-12-23', days: 3, portion: 'full', notes: 'Year-end travel.', status: 'approved', submitted: '2026-09-30', reviewer: 'Pieter van Wyk' },
{ id: 'l-lindiwe', memberId: 'm-lindiwe', type: 'annual', start: '2026-11-04', end: '2026-11-05', days: 2, portion: 'full', notes: '', status: 'approved', submitted: '2026-10-15', reviewer: 'Pieter van Wyk' }];


export const seedBalances: LeaveBalance[] = [
{ type: 'annual', available: 11.5, used: 6.5, basis: 'statutory', note: 'Statutory minimum plus employer policy. Accrual configurable.' },
{ type: 'sick', available: 27, used: 3, basis: 'statutory', note: 'Current 36-month sick-leave cycle. Calculation configurable.' },
{ type: 'family', available: 3, used: 0, basis: 'verify', note: 'Eligibility rules awaiting HR verification.' },
{ type: 'parental', available: null, used: 0, basis: 'verify', note: 'Depends on circumstances. Entitlement under recent legal developments — awaiting legal/HR verification.' },
{ type: 'study', available: 2, used: 0, basis: 'employer', note: 'Employer-specific benefit.' },
{ type: 'unpaid', available: null, used: 0, basis: 'employer', note: 'By arrangement with your manager.' }];


export const seedAudit: AuditEntry[] = [
{ id: 'a-1', date: '2026-10-26', time: '07:31', actor: 'Zanele Mthembu', action: 'Submitted correction request', target: 'Clock-in 26 Oct', category: 'correction' },
{ id: 'a-2', date: '2026-10-24', time: '09:12', actor: 'Sipho Dlamini', action: 'Submitted correction request', target: 'Clock-out 23 Oct', category: 'correction' },
{ id: 'a-3', date: '2026-10-23', time: '08:40', actor: 'Pieter van Wyk', action: 'Approved correction', target: 'Thandi Nkosi · idle 22 Oct 14:00–14:40', reason: 'Matches the client call on the Shoprite calendar.', category: 'correction' },
{ id: 'a-4', date: '2026-10-22', time: '14:05', actor: 'Lerato Mokoena', action: 'Sent invitation', target: 'keabetswe@mzansiwork.co.za', category: 'invitation' },
{ id: 'a-5', date: '2026-10-20', time: '11:20', actor: 'Lerato Mokoena', action: 'Exported report', target: 'Monthly timesheets · Sep 2026 (Approved values, CSV)', category: 'export' },
{ id: 'a-6', date: '2026-10-14', time: '00:02', actor: 'System', action: 'Subscription renewed', target: 'Small Business · monthly · R119.99', category: 'subscription' },
{ id: 'a-7', date: '2026-10-08', time: '00:00', actor: 'System', action: 'Invitation expired — seat released', target: 'jason.smith@mzansiwork.co.za', category: 'invitation' },
{ id: 'a-8', date: '2026-10-01', time: '09:30', actor: 'Lerato Mokoena', action: 'Delegated approvals', target: 'Nomsa Khumalo · Design team until 30 Nov', category: 'role' },
{ id: 'a-9', date: '2026-09-01', time: '10:00', actor: 'Lerato Mokoena', action: 'Updated tracking policy', target: 'Idle threshold 10 → 5 min (v3)', reason: 'Align with agent defaults after employee consultation.', category: 'policy' },
{ id: 'a-10', date: '2026-08-29', time: '16:45', actor: 'Lerato Mokoena', action: 'Deactivated employee', target: 'Grant Fourie', reason: 'Resigned — last working day 29 Aug. History retained.', category: 'member' },
{ id: 'a-11', date: '2026-10-26', time: '06:40', actor: 'Pieter van Wyk', action: 'Signed in from new device', target: 'iPhone 15 · Cape Town', category: 'security' }];


export const seedNotifications: AppNotification[] = [
{ id: 'n-1', app: 'employer', title: 'Correction request from Zanele Mthembu', body: 'Clock-in 07:22 → 06:55 on Mon 26 Oct.', date: '2026-10-26', time: '07:31', read: false, tone: 'warning' },
{ id: 'n-2', app: 'employer', title: 'Leave request from Kagiso Molefe', body: 'Family responsibility leave · Thu 29 Oct.', date: '2026-10-26', time: '07:05', read: false, tone: 'warning' },
{ id: 'n-3', app: 'employer', title: 'Missing clock-out: Ruan Steyn', body: 'Night session from Sun 25 Oct 21:57 is still open.', date: '2026-10-26', time: '06:15', read: false, tone: 'danger' },
{ id: 'n-4', app: 'employer', title: 'Upcoming renewal', body: 'Small Business renews on Sat 14 Nov 2026 · R119.99.', date: '2026-10-25', time: '09:00', read: true, tone: 'info' },
{ id: 'n-5', app: 'employee', title: 'Timesheet due Friday', body: 'Submit week 44 by Fri 30 Oct at 17:00.', date: '2026-10-26', time: '07:00', read: false, tone: 'info' },
{ id: 'n-6', app: 'employee', title: 'An interval is waiting for you', body: 'Fri 23 Oct 15:10–15:35 was observed as idle. Add an explanation if it was work.', date: '2026-10-24', time: '08:00', read: false, tone: 'warning' },
{ id: 'n-7', app: 'employee', title: 'Correction approved', body: 'Thu 22 Oct 14:00–14:40 classified as Telephone call by Pieter van Wyk.', date: '2026-10-23', time: '08:40', read: true, tone: 'success' },
{ id: 'n-8', app: 'employee', title: 'Tracking policy updated', body: 'Idle threshold changed to 5 minutes (v3). Review what is collected.', date: '2026-09-01', time: '10:00', read: true, tone: 'info' }];


export const seedExports: ExportJob[] = [
{ id: 'x-1', report: 'Monthly timesheets', format: 'CSV', range: 'Sep 2026', dataType: 'Approved values', status: 'done', date: '2026-10-20', time: '11:20', rows: 312 },
{ id: 'x-2', report: 'Leave balances', format: 'PDF', range: 'As at 1 Oct 2026', dataType: 'Finalised records', status: 'done', date: '2026-10-01', time: '08:15', rows: 15 }];