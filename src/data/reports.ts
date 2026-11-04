export type ReportDataType = 'Raw observations' | 'Employee-submitted corrections' | 'Approved timesheet values' | 'Finalised records' | 'Mixed — labelled per column';

export interface ReportDef {
  id: string;
  name: string;
  group: 'Attendance' | 'Timesheets' | 'Review' | 'Leave' | 'Administration';
  description: string;
  dataType: ReportDataType;
  filters: string[];
  columns: string[];
  rows: (string | number)[][];
  chart?: {label: string;value: number;}[];
}

export const reports: ReportDef[] = [
{ id: 'daily', name: 'Daily attendance', group: 'Attendance', description: 'Who worked today, when, and current status.', dataType: 'Raw observations', filters: ['Date', 'Branch', 'Department', 'Attendance status'], columns: ['Employee', 'In', 'Hours', 'Status'], rows: [['Lerato Mokoena', '07:48', 2.7, 'Clocked in'], ['Johan Botha', '06:58', 3.5, 'Requires review'], ['Sipho Dlamini', '09:24', 1.1, 'Late'], ['Kagiso Molefe', '—', 0, 'Not clocked in']] },
{ id: 'weekly', name: 'Weekly timesheets', group: 'Timesheets', description: 'Approved and pending hours per employee for the week.', dataType: 'Approved timesheet values', filters: ['Date range', 'Department', 'Branch', 'Approval status'], columns: ['Employee', 'Approved', 'Pending', 'Status'], rows: [['Lerato Mokoena', 42.6, 0, 'Approved'], ['Thandi Nkosi', 32.7, 7.5, 'Partly pending'], ['Sipho Dlamini', 0, 40.9, 'Pending'], ['Aisha Patel', 39.4, 0, 'Approved'], ['Johan Botha', 0, 40.7, 'Pending']], chart: [{ label: 'Lerato', value: 42.6 }, { label: 'Thandi', value: 40.2 }, { label: 'Sipho', value: 40.9 }, { label: 'Aisha', value: 39.4 }, { label: 'Johan', value: 40.7 }] },
{ id: 'monthly', name: 'Monthly timesheets', group: 'Timesheets', description: 'Month totals for payroll preparation (estimates until finalised).', dataType: 'Finalised records', filters: ['Month', 'Department', 'Branch'], columns: ['Employee', 'Approved', 'Leave days', 'Overtime est.'], rows: [['Lerato Mokoena', 176.2, 0, 4.2], ['Thandi Nkosi', 160.4, 1, 0], ['Sipho Dlamini', 168.1, 0, 1.5]] },
{ id: 'employee', name: 'Hours by employee', group: 'Timesheets', description: 'Recorded versus approved hours per person.', dataType: 'Mixed — labelled per column', filters: ['Date range', 'Employee', 'Department'], columns: ['Employee', 'Recorded (raw)', 'Approved'], rows: [['Thandi Nkosi', 40.2, 32.7], ['Johan Botha', 40.7, 0], ['Zanele Mthembu', 40.5, 40.5]] },
{ id: 'project', name: 'Hours by project & task', group: 'Timesheets', description: 'Where time was allocated this week.', dataType: 'Approved timesheet values', filters: ['Date range', 'Project', 'Task', 'Approval status'], columns: ['Project', 'Task', 'Hours'], rows: [['Shoprite Rewards App', 'Checkout redesign', 38.5], ['Shoprite Rewards App', 'Rewards API integration', 41], ['Internal Website', 'Information architecture', 16.5], ['Client Onboarding', 'Support queue', 40.5]], chart: [{ label: 'Shoprite', value: 96.5 }, { label: 'Website', value: 31 }, { label: 'Onboarding', value: 58 }, { label: 'Reliability', value: 22 }] },
{ id: 'billable', name: 'Billable vs non-billable', group: 'Timesheets', description: 'Share of approved time that is billable.', dataType: 'Approved timesheet values', filters: ['Date range', 'Project', 'Department'], columns: ['Category', 'Hours', 'Share'], rows: [['Billable', 154.5, '75%'], ['Non-billable', 53, '25%']], chart: [{ label: 'Billable', value: 154.5 }, { label: 'Non-billable', value: 53 }] },
{ id: 'breaks', name: 'Break summaries', group: 'Attendance', description: 'Break time by category and person.', dataType: 'Raw observations', filters: ['Date range', 'Department'], columns: ['Category', 'Count', 'Avg', 'Over expected'], rows: [['Tea break', 64, '14m', 6], ['Lunch break', 71, '43m', 9], ['Smoke break', 12, '9m', 1]] },
{ id: 'exceptions', name: 'Attendance exceptions', group: 'Attendance', description: 'Missing clock-outs, late starts, duplicates and overlaps.', dataType: 'Raw observations', filters: ['Date range', 'Branch', 'Attendance status'], columns: ['Employee', 'Exception', 'Date', 'Next action'], rows: [['Ruan Steyn', 'Missing clock-out', 'Sun 25 Oct', 'Awaiting correction'], ['Sipho Dlamini', 'Late start (24 min)', 'Mon 26 Oct', 'None required'], ['Sipho Dlamini', 'Missing clock-out', 'Fri 23 Oct', 'Correction pending']] },
{ id: 'overtime', name: 'Overtime & schedule exceptions', group: 'Attendance', description: 'Estimated overtime against configured schedules.', dataType: 'Approved timesheet values', filters: ['Date range', 'Department'], columns: ['Employee', 'Scheduled', 'Approved', 'Est. overtime'], rows: [['Lerato Mokoena', 40, 42.6, 2.6], ['Michael Jacobs', 40, 39.3, 0]] },
{ id: 'inactivity', name: 'Inactivity observations', group: 'Review', description: 'Agent idle intervals and whether they are explained. Observations, not conclusions.', dataType: 'Raw observations', filters: ['Date range', 'Employee', 'Approval status'], columns: ['Employee', 'Interval', 'Status'], rows: [['Johan Botha', '26 Oct 09:10–09:40', 'Unclassified'], ['Thandi Nkosi', '23 Oct 15:10–15:35', 'Unclassified'], ['Thandi Nkosi', '22 Oct 14:00–14:40', 'Approved — Telephone call']] },
{ id: 'corrections', name: 'Corrections & outcomes', group: 'Review', description: 'Requests submitted and how they were decided.', dataType: 'Employee-submitted corrections', filters: ['Date range', 'Employee', 'Approval status'], columns: ['Employee', 'Request', 'Outcome'], rows: [['Zanele Mthembu', 'Clock-in 07:22 → 06:55', 'Pending'], ['Sipho Dlamini', 'Clock-out 17:40', 'Pending'], ['Thandi Nkosi', 'Idle → Telephone call', 'Approved'], ['Johan Botha', 'Break split', 'More info requested']] },
{ id: 'leave', name: 'Leave balances & history', group: 'Leave', description: 'Balances and taken leave per employee (configurable rules).', dataType: 'Finalised records', filters: ['Date range', 'Employee', 'Department'], columns: ['Employee', 'Annual left', 'Sick used', 'Status'], rows: [['Thandi Nkosi', 11.5, 3, 'OK'], ['David Naidoo', 3, 1, 'Low balance'], ['Johan Botha', 4.5, 0, 'Low balance']] },
{ id: 'audit', name: 'Audit & admin activity', group: 'Administration', description: 'Approvals, role changes, exports and policy changes.', dataType: 'Finalised records', filters: ['Date range', 'Employee'], columns: ['When', 'Actor', 'Action'], rows: [['23 Oct 08:40', 'Pieter van Wyk', 'Approved correction'], ['22 Oct 14:05', 'Lerato Mokoena', 'Sent invitation'], ['20 Oct 11:20', 'Lerato Mokoena', 'Exported report']] }];


export const dataTypeHelp: Record<ReportDataType, string> = {
  'Raw observations': 'Unreviewed records exactly as captured. Not approved hours.',
  'Employee-submitted corrections': 'Requests made by employees. Pending items are not applied.',
  'Approved timesheet values': 'Hours after manager review. Pending corrections are excluded.',
  'Finalised records': 'Locked, approved values for a closed period.',
  'Mixed — labelled per column': 'Raw and approved values appear in separately labelled columns.'
};