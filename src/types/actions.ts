import type { AgentConnection, AgentScreen, AgentSettingsTab } from './agent';
import type { ExportFormat, Frequency, PlanId } from './billing';
import type { DemoState, EmployeeIssue, EmployeeViewport } from './demo';
import type { EmployeeRoute, EmployerRoute, EmployerTab, FlowId } from './nav';
import type { AppId, AuditCategory, Branch, Role, Tone, ViewerRole } from './org';
import type { CorrectionKind, LeaveType, Project } from './time';
import type { WorkspaceSnapshot } from './workspace';

export interface CorrectionPayload {
  kind: CorrectionKind;
  date: string;
  intervalId?: string;
  original: string;
  requested: string;
  classification?: string;
  reason: string;
  notes?: string;
  source: 'browser' | 'agent';
  durationSec?: number;
}

export interface LeavePayload {
  type: LeaveType;
  start: string;
  end: string;
  days: number;
  portion: 'full' | 'morning' | 'afternoon';
  notes: string;
  document?: string;
  contact?: string;
}

export type DemoAction =
{type: 'EMPLOYER_PUSH';route: EmployerRoute;} |
{type: 'EMPLOYER_BACK';} |
{type: 'EMPLOYER_TAB';tab: EmployerTab;} |
{type: 'EMPLOYER_SIGN_IN';} |
{type: 'ENTER_WORKSPACE';app: 'employer' | 'employee';workspace: WorkspaceSnapshot;} |
{type: 'EMPLOYER_SIGN_OUT';} |
{
  type: 'ONBOARD_COMPLETE';
  orgName: string;
  ownerName: string;
  planId: PlanId;
  frequency: Frequency;
  invites: {email: string;role: Role;}[];
} |
{type: 'EMPLOYEE_NAV';route: EmployeeRoute;} |
{type: 'EMPLOYEE_SIGN_IN';} |
{type: 'EMPLOYEE_SIGN_OUT';} |
{type: 'EMPLOYEE_ISSUE';issue: EmployeeIssue;} |
{type: 'EMPLOYEE_VIEWPORT';viewport: EmployeeViewport;} |
{type: 'SET_ROLE';role: ViewerRole;} |
{type: 'CLOCK_IN';projectId?: string;taskId?: string;category: string;} |
{type: 'SWITCH_TASK';projectId?: string;taskId?: string;category: string;} |
{type: 'START_BREAK';category: string;} |
{type: 'END_BREAK';} |
{type: 'CLOCK_OUT';} |
{type: 'UNDO_CLOCK_OUT';} |
{type: 'SUBMIT_DAY';} |
{type: 'SUBMIT_CORRECTION';payload: CorrectionPayload;} |
{type: 'WITHDRAW_CORRECTION';id: string;} |
{type: 'REVIEW_CORRECTION';id: string;decision: 'approved' | 'rejected' | 'info_requested';reason: string;} |
{type: 'RESPOND_INFO';id: string;note: string;} |
{type: 'SUBMIT_LEAVE';payload: LeavePayload;} |
{type: 'WITHDRAW_LEAVE';id: string;} |
{type: 'REVIEW_LEAVE';id: string;decision: 'approved' | 'rejected' | 'info_requested';reason: string;} |
{type: 'SEND_INVITE';email: string;role: Role;department: string;branch: Branch;} |
{type: 'INVITE_BLOCKED';email: string;} |
{type: 'RESEND_INVITE';id: string;} |
{type: 'CANCEL_INVITE';id: string;} |
{type: 'EXPIRE_INVITE';id: string;} |
{type: 'ACCEPT_INVITE';id: string;name: string;} |
{type: 'DEACTIVATE_MEMBER';id: string;reason: string;} |
{type: 'REACTIVATE_MEMBER';id: string;} |
{type: 'CHANGE_ROLE';id: string;role: Role;} |
{type: 'CHANGE_PLAN';planId: PlanId;frequency: Frequency;users?: number;} |
{type: 'SCHEDULE_FREQUENCY';frequency: Frequency;} |
{type: 'CANCEL_SCHEDULED';} |
{type: 'PAYMENT_FAIL';} |
{type: 'RETRY_PAYMENT';ok: boolean;} |
{type: 'UPDATE_PAYMENT_METHOD';label: string;} |
{type: 'CANCEL_SUBSCRIPTION';} |
{type: 'RESUME_SUBSCRIPTION';} |
{type: 'EXPORT_START';id: string;report: string;format: ExportFormat;range: string;dataType: string;willFail?: boolean;} |
{type: 'EXPORT_DONE';id: string;ok: boolean;} |
{type: 'AGENT_NAV';screen: AgentScreen;} |
{type: 'AGENT_SETTINGS_TAB';tab: AgentSettingsTab;} |
{type: 'AGENT_FIRST_RUN_DONE';} |
{type: 'AGENT_SIGN_IN';} |
{type: 'AGENT_SIGN_OUT';} |
{type: 'AGENT_SET_CONNECTION';connection: AgentConnection;} |
{type: 'AGENT_IDLE_START';} |
{type: 'AGENT_IDLE_END';} |
{type: 'AGENT_SYNC_DONE';ok: boolean;} |
{type: 'AGENT_TOGGLE_NOTIFICATIONS';} |
{type: 'AGENT_PAUSE';paused: boolean;} |
{type: 'AGENT_UPDATE';action: 'install' | 'dismiss' | 'make_available';} |
{type: 'TOAST';app: AppId;message: string;tone: Tone;} |
{type: 'DISMISS_TOAST';id: string;} |
{type: 'MARK_READ';app: 'employer' | 'employee';} |
{type: 'FLOW_STEP';delta: number;} |
{type: 'END_FLOW';} |
{type: 'SET_FOCUS';app: AppId | null;} |
{type: 'SET_VIEW';view: DemoState['view'];section?: string;} |
{type: 'AUDIT_LOG';category: AuditCategory;action: string;target: string;reason?: string;toast?: string;} |
{type: 'ADD_PROJECT';project: Project;} |
{type: 'ADD_TASK';projectId: string;name: string;billable: boolean;} |
{type: 'REPLACE_STATE';state: DemoState;};

export type StampedAction = DemoAction & {now: number;};

export type FlowStartAction = {id: FlowId;};