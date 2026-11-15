import type { AgentState } from './agent';
import type { ExportJob, Subscription } from './billing';
import type { EmployeeRoute, EmployerRoute, FlowId } from './nav';
import type { AppId, AppNotification, AuditEntry, Branch, Invitation, Member, Tone, ViewerRole } from './org';
import type { Correction, Interval, LeaveBalance, LeaveOpening, LeavePolicy, LeaveRequest, Project, Session, TimeEvent } from './time';
import type { EmployeeWorkOptions } from './workspace';

export interface Toast {
  id: string;
  app: AppId;
  message: string;
  tone: Tone;
}

export interface FeedItem {
  id: string;
  time: string;
  app: AppId;
  text: string;
}

export type EmployeeIssue = null | 'offline' | 'session_expired' | 'duplicate_device';
export type EmployeeViewport = 'fit' | 'tablet' | 'mobile';

export interface DemoState {
  orgId: string;
  employeeMemberId: string;
  org: {
    name: string;
    timezone: string;
    currency: string;
    week: string;
    hours: string;
    branches: Branch[];
    contact: string;
  };
  viewerRole: ViewerRole;
  viewerMemberId: string;
  employerAuthed: boolean;
  employerStack: EmployerRoute[];
  employeeAuthed: boolean;
  employeeRoute: EmployeeRoute;
  employeeIssue: EmployeeIssue;
  employeeViewport: EmployeeViewport;
  members: Member[];
  /** member id → the person the owner chose to approve that member's timesheets and leave */
  approverFor: Record<string, string>;
  invitations: Invitation[];
  lastInviteId?: string;
  session: Session;
  intervals: Interval[];
  events: TimeEvent[];
  corrections: Correction[];
  daySubmissions: Record<string, 'open' | 'submitted' | 'approved'>;
  leave: LeaveRequest[];
  leavePolicies: LeavePolicy[];
  leaveOpenings: LeaveOpening[];
  balances: LeaveBalance[];
  projects: Project[];
  employeeWorkOptions: EmployeeWorkOptions;
  employeeWorkOptionsLoading: boolean;
  subscription: Subscription;
  exports: ExportJob[];
  audit: AuditEntry[];
  notifications: AppNotification[];
  agent: AgentState;
  toasts: Toast[];
  feed: FeedItem[];
  flow: {id: FlowId;step: number;} | null;
  focus: AppId | null;
  view: 'canvas' | 'docs';
  docsSection: string;
}