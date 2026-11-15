export type EmployerScreen =
'welcome' |
'signin' |
'forgot' |
'create' |
'org' |
'plan' |
'invite-first' |
'done' |
'dashboard' |
'attendance' |
'attendance-detail' |
'employees' |
'employee' |
'invite' |
'seats' |
'approvals' |
'correction' |
'leave-request' |
'more' |
'reports' |
'report' |
'exports' |
'emails' |
'live' |
'leave' |
'leave-policy' |
'projects' |
'settings' |
'policy' |
'roles' |
'subscription' |
'compare' |
'plan-change' |
'failed-payment' |
'cancel' |
'audit' |
'notifications' |
'profile' |
'help';

export type EmployerTab = 'dashboard' | 'attendance' | 'employees' | 'approvals' | 'more';

export interface EmployerRoute {
  name: EmployerScreen;
  params?: Record<string, string>;
}

export type EmployeeScreen =
'signin' |
'signup' |
'invite' |
'setup' |
'reset' |
'day' |
'timesheets' |
'activity' |
'leave' |
'tasks' |
'notifications' |
'profile' |
'policy' |
'denied';

export interface EmployeeRoute {
  name: EmployeeScreen;
  params?: Record<string, string>;
}

export type FlowId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';