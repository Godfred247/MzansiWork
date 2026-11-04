import type { DemoAction } from '../types/actions';
import type { FlowId } from '../types/nav';
import type { AppId } from '../types/org';

export interface FlowStep {
  app: AppId | 'canvas';
  text: string;
  advanceOn?: {type: DemoAction['type'];route?: string;};
}

export interface Flow {
  id: FlowId;
  title: string;
  summary: string;
  steps: FlowStep[];
}

export const flows: Flow[] = [
{
  id: 'A', title: 'Employer onboarding', summary: 'Create owner account → configure organisation → choose paid plan → invite → dashboard.',
  steps: [
  { app: 'employer', text: 'On the Welcome screen, tap “Create an organisation account”.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'create' } },
  { app: 'employer', text: 'Fill in owner details. Try a short password to see validation.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'org' } },
  { app: 'employer', text: 'Confirm organisation details — Africa/Johannesburg is the default.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'plan' } },
  { app: 'employer', text: 'Choose a paid plan. Starter is monthly only; others show the 10% annual saving.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'invite-first' } },
  { app: 'employer', text: 'Add employee emails and watch the seat counter.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'done' } },
  { app: 'employer', text: 'Open the dashboard.', advanceOn: { type: 'ONBOARD_COMPLETE' } }]

},
{
  id: 'B', title: 'Employee invitation', summary: 'Invite → seat check → invitation sent → employee accepts → joins.',
  steps: [
  { app: 'employer', text: 'Enter a new email (e.g. naledi@karoodigital.co.za) and send the invitation.', advanceOn: { type: 'SEND_INVITE' } },
  { app: 'employee', text: 'The invitation link opens in the browser. Click “Accept invitation”.', advanceOn: { type: 'EMPLOYEE_NAV', route: 'setup' } },
  { app: 'employee', text: 'Set a name and password, then join Karoo Digital.', advanceOn: { type: 'ACCEPT_INVITE' } },
  { app: 'employer', text: 'Back in Employees → Invitations, the status is now Accepted and the seat moved from reserved to active.' }]

},
{
  id: 'C', title: 'Seat limit', summary: 'Starter plan full → invitation blocked → compare plans → explicit upgrade or cancel.',
  steps: [
  { app: 'employer', text: 'Starter: 5 users = 4 active + 1 pending. Enter any new email and tap Check & send.', advanceOn: { type: 'INVITE_BLOCKED' } },
  { app: 'employer', text: 'Read the seat calculation, then tap “Compare plans”.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'compare' } },
  { app: 'employer', text: 'Choose Small Business and review the price difference.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'plan-change' } },
  { app: 'employer', text: 'Confirm explicitly — or cancel. Nothing changes until you confirm.', advanceOn: { type: 'CHANGE_PLAN' } },
  { app: 'employer', text: 'Go back to Invite employee — the invitation can now be sent.', advanceOn: { type: 'SEND_INVITE' } }]

},
{
  id: 'D', title: 'Employee workday', summary: 'Clock in → task → break → resume → clock out → daily summary.',
  steps: [
  { app: 'employee', text: 'Pick a project and task (optional), then Clock in.', advanceOn: { type: 'CLOCK_IN' } },
  { app: 'agent', text: 'The desktop agent switches to “Tracking active” for the same session. Continue in the browser.' },
  { app: 'employee', text: 'Click “Take a break” and choose a category.', advanceOn: { type: 'START_BREAK' } },
  { app: 'employee', text: 'Click “End break” to resume work.', advanceOn: { type: 'END_BREAK' } },
  { app: 'canvas', text: 'Use “+1h” on the demo clock (top bar) to move through the day. Watch the employer dashboard update.' },
  { app: 'employee', text: 'Clock out and confirm.', advanceOn: { type: 'CLOCK_OUT' } },
  { app: 'employee', text: 'Review the daily summary and submit the day for review.', advanceOn: { type: 'SUBMIT_DAY' } }]

},
{
  id: 'E', title: 'Inactivity correction', summary: 'Agent observes idle → employee explains → manager decides → timesheet updates, original kept.',
  steps: [
  { app: 'agent', text: 'Click “Simulate idle (demo)” — the OS idle threshold is reached.', advanceOn: { type: 'AGENT_IDLE_START' } },
  { app: 'agent', text: 'Simulate returning after 45 min. The agent records the active transition.', advanceOn: { type: 'AGENT_IDLE_END' } },
  { app: 'employee', text: 'In My Activity, open the new interval and explain it (e.g. In-person meeting).', advanceOn: { type: 'SUBMIT_CORRECTION' } },
  { app: 'employer', text: 'Open Approvals and tap Thandi’s request.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'correction' } },
  { app: 'employer', text: 'Approve, reject with a reason, or request more information.', advanceOn: { type: 'REVIEW_CORRECTION' } },
  { app: 'employee', text: 'Open My Timesheets → today: the decision shows beside the original observation, which is preserved.' }]

},
{
  id: 'F', title: 'Leave management', summary: 'Employee requests leave → manager decides → employee notified.',
  steps: [
  { app: 'employee', text: 'Click “Request leave”, choose a type and dates, review the duration and submit.', advanceOn: { type: 'SUBMIT_LEAVE' } },
  { app: 'employer', text: 'In Approvals → Leave, open Thandi’s request.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'leave-request' } },
  { app: 'employer', text: 'Check balance and overlaps, then approve or reject with a reason.', advanceOn: { type: 'REVIEW_LEAVE' } },
  { app: 'employee', text: 'Thandi sees the decision in My Leave and Notifications.' }]

},
{
  id: 'G', title: 'Employer reporting', summary: 'Choose report → filter → review → export → status.',
  steps: [
  { app: 'employer', text: 'Open “Weekly timesheets”.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'report' } },
  { app: 'employer', text: 'Adjust filters: date range, department, approval status. Note the data-type label.' },
  { app: 'employer', text: 'Export as CSV, Excel or PDF.', advanceOn: { type: 'EXPORT_START' } },
  { app: 'employer', text: 'Watch the export status update.', advanceOn: { type: 'EXPORT_DONE' } }]

},
{
  id: 'H', title: 'Subscription management', summary: 'Review plan → change plan or billing frequency → explicit confirmation.',
  steps: [
  { app: 'employer', text: 'Review the current plan and seats. Tap “Compare plans”.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'compare' } },
  { app: 'employer', text: 'Choose a plan or switch to annual billing to see the 10% saving.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'plan-change' } },
  { app: 'employer', text: 'Read the price, effective date and next billing date. Confirm or cancel.', advanceOn: { type: 'CHANGE_PLAN' } }]

},
{
  id: 'I', title: 'Offline desktop agent', summary: 'Connection lost → events queued → reconnect → sync with duplicates skipped.',
  steps: [
  { app: 'agent', text: 'Use the demo control “Go offline”.', advanceOn: { type: 'AGENT_SET_CONNECTION' } },
  { app: 'agent', text: 'Simulate idle — the observation is saved locally, not on the server.', advanceOn: { type: 'AGENT_IDLE_START' } },
  { app: 'agent', text: 'Simulate returning. Note the pending event count.', advanceOn: { type: 'AGENT_IDLE_END' } },
  { app: 'agent', text: 'Reconnect. The agent synchronises and skips the duplicate event.', advanceOn: { type: 'AGENT_SYNC_DONE' } },
  { app: 'employee', text: 'The interval now appears in My Activity because it has reached the server.' }]

},
{
  id: 'J', title: 'Permission restrictions', summary: 'Employee blocked from employer screens; manager without billing permission restricted.',
  steps: [
  { app: 'employee', text: 'Thandi opened an employer billing link — access is denied with a clear explanation.' },
  { app: 'canvas', text: 'Switch the employer role to “Manager” in the top bar.', advanceOn: { type: 'SET_ROLE' } },
  { app: 'employer', text: 'Open More → Subscription and billing. Billing is restricted to the owner.', advanceOn: { type: 'EMPLOYER_PUSH', route: 'subscription' } }]

}];