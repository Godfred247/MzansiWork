export type Role = 'owner' | 'manager' | 'approver' | 'employee';
export type ViewerRole = 'owner' | 'manager' | 'approver';
export type Branch = string;
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
export type AppId = 'employer' | 'employee' | 'agent';

export type AttendanceStatus =
'not_clocked_in' |
'clocked_in' |
'on_break' |
'clocked_out' |
'late' |
'missing_clock_out' |
'pending_correction' |
'requires_review' |
'on_leave' |
'day_off';

export interface Schedule {
  label: string;
  start: string;
  end: string;
  days: string;
  overnight?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  department: string;
  branch: Branch;
  schedule: Schedule;
  status: 'active' | 'inactive';
  startDate: string;
  attendance: AttendanceStatus;
  clockIn?: string;
  hoursToday: number;
  breakNow?: string;
  unresolvedIdle: number;
  usesAgent: boolean;
  currentTask?: string;
  deactivatedOn?: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled' | 'failed';

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  department: string;
  branch: Branch;
  status: InviteStatus;
  sentAt: string;
  expiresAt: string;
  invitedBy: string;
  acceptedName?: string;
}

export type AuditCategory =
'invitation' |
'role' |
'attendance' |
'correction' |
'leave' |
'policy' |
'subscription' |
'export' |
'security' |
'member';

export interface AuditEntry {
  id: string;
  date: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  reason?: string;
  category: AuditCategory;
}

export interface AppNotification {
  id: string;
  app: 'employer' | 'employee';
  title: string;
  body: string;
  date: string;
  time: string;
  read: boolean;
  tone: Tone;
}