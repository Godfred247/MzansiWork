export type IntervalType = 'work' | 'break' | 'idle';
export type IntervalStatus =
'recorded' |
'unclassified' |
'awaiting_review' |
'info_requested' |
'approved' |
'rejected';
export type EventSource = 'browser' | 'agent' | 'server';

export interface Interval {
  id: string;
  memberId: string;
  date: string;
  type: IntervalType;
  startSec: number;
  endSec?: number;
  projectId?: string;
  taskId?: string;
  category?: string;
  breakCategory?: string;
  status: IntervalStatus;
  classification?: string;
  source: EventSource;
  correctionId?: string;
  queued?: boolean;
}

export type EventKind =
'clock_in' |
'clock_out' |
'break_start' |
'break_end' |
'idle_start' |
'active_resumed' |
'task_switch' |
'sync' |
'correction_submitted' |
'decision' |
'clock_out_reversed';

export interface TimeEvent {
  id: string;
  memberId: string;
  date: string;
  sec: number;
  kind: EventKind;
  source: EventSource;
  detail: string;
  synced: boolean;
}

export type CorrectionStatus =
'draft' |
'submitted' |
'pending' |
'info_requested' |
'approved' |
'rejected' |
'withdrawn';

export type CorrectionKind = 'idle_classification' | 'clock_in' | 'clock_out' | 'break' | 'task';

export interface CorrectionHistory {
  date: string;
  time: string;
  actor: string;
  status: CorrectionStatus;
  note?: string;
}

export interface Correction {
  id: string;
  memberId: string;
  date: string;
  kind: CorrectionKind;
  intervalId?: string;
  original: string;
  requested: string;
  classification?: string;
  reason: string;
  notes?: string;
  status: CorrectionStatus;
  history: CorrectionHistory[];
  source: 'browser' | 'agent';
  projectId?: string;
  durationSec?: number;
  decisionReason?: string;
  reviewer?: string;
}

export type LeaveType =
'annual' |
'sick' |
'family' |
'parental' |
'adoption' |
'commissioning' |
'unpaid' |
'study';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'info_requested' | 'withdrawn';

export interface LeaveRequest {
  id: string;
  memberId: string;
  type: LeaveType;
  start: string;
  end: string;
  days: number;
  portion: 'full' | 'morning' | 'afternoon';
  notes: string;
  status: LeaveStatus;
  submitted: string;
  reviewer?: string;
  decisionReason?: string;
  document?: string;
  contact?: string;
}

export type BalanceBasis = 'statutory' | 'employer' | 'verify';

export interface LeaveBalance {
  type: LeaveType;
  available: number | null;
  used: number;
  basis: BalanceBasis;
  note: string;
}

export interface Task {
  id: string;
  name: string;
  assignees: string[];
  billable: boolean;
  status: 'open' | 'done';
}

export interface Project {
  id: string;
  name: string;
  client?: string;
  description: string;
  billable: boolean;
  status: 'active' | 'paused' | 'completed';
  members: string[];
  start?: string;
  end?: string;
  tasks: Task[];
  hoursWeek: number;
}

export interface Session {
  state: 'clocked_out' | 'clocked_in' | 'on_break' | 'ended';
  clockInSec?: number;
  clockOutSec?: number;
  breakStartSec?: number;
  breakCategory?: string;
  projectId?: string;
  taskId?: string;
  category: string;
  submitted: boolean;
  workIntervalId?: string;
  breakIntervalId?: string;
}