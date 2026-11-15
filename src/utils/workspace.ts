import type { DemoState } from '../types/demo';
import { secToLabel } from './time';
import type { Branch, Invitation, Member, Role } from '../types/org';
import type { Project } from '../types/time';
import type { WorkspaceSnapshot } from '../types/workspace';

export const DEMO_ORG_ID = '11111111-1111-1111-1111-111111111111';

export function isLiveOrg(orgId: string | undefined): boolean {
  return !!orgId && orgId !== DEMO_ORG_ID;
}

const office = { label: 'Standard office', start: '08:00', end: '17:00', days: 'Mon–Fri' };

function branchOf(value: string): Branch {
  return value.trim();
}

function roleOf(value: string): Role {
  if (value === 'owner' || value === 'manager' || value === 'approver' || value === 'employee') return value;
  return 'employee';
}

function toMember(person: WorkspaceSnapshot['people'][number]): Member {
  return {
    id: person.id,
    name: person.fullName,
    email: person.email,
    role: roleOf(person.role),
    title: roleOf(person.role) === 'owner' ? 'Owner' : roleOf(person.role) === 'manager' ? 'Manager' : 'Employee',
    department: person.department || 'General',
    branch: branchOf(person.branch),
    schedule: office,
    status: person.status === 'inactive' ? 'inactive' : 'active',
    startDate: new Date().toISOString().slice(0, 10),
    attendance: 'not_clocked_in',
    hoursToday: 0,
    unresolvedIdle: 0,
    usesAgent: false
  };
}

function generalProject(members: Member[], organisation: string): Project {
  const ids = members.map((m) => m.id);
  return {
    id: 'p-general',
    name: 'General',
    client: organisation,
    description: 'Work that is not on a named project.',
    billable: false,
    status: 'active',
    members: ids,
    hoursWeek: 0,
    tasks: [{ id: 't-general', name: 'General work', assignees: ids, billable: false, status: 'open' }]
  };
}

export function applyWorkspace(state: DemoState, workspace: WorkspaceSnapshot, app: 'employer' | 'employee', now: number): DemoState {
  const members = workspace.people.map(toMember);
  const invitations: Invitation[] = workspace.invitations.map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: roleOf(invite.role),
    department: invite.department || 'General',
    branch: branchOf(invite.branch),
    status: invite.status === 'accepted' || invite.status === 'expired' || invite.status === 'cancelled' || invite.status === 'failed' ? invite.status : 'pending',
    sentAt: invite.sentAt,
    expiresAt: invite.expiresAt,
    invitedBy: workspace.people.find((p) => p.role === 'owner')?.fullName ?? 'Owner'
  }));
  const sameOrganisation = state.orgId === workspace.organisation.id && state.orgId !== '';
  const branches = [...new Set(members.map((m) => m.branch))];
  let next: DemoState = {
    ...state,
    orgId: workspace.organisation.id,
    org: {
      name: workspace.organisation.name,
      timezone: workspace.organisation.timezone || 'Africa/Johannesburg',
      currency: 'ZAR',
      week: workspace.organisation.workingWeek || 'Monday – Friday',
      hours: workspace.organisation.standardHours || '08:00 – 17:00',
      branches: branches.filter(Boolean),
      contact: workspace.organisation.contact
    },
    members,
    invitations,
    subscription: {
      planId: workspace.subscription.planId,
      frequency: workspace.subscription.frequency,
      enterpriseUsers: workspace.subscription.enterpriseUsers,
      renewal: workspace.subscription.renewal.slice(0, 10),
      termStart: new Date().toISOString().slice(0, 10),
      payment: workspace.subscription.paymentStatus === 'failed' ? 'failed' : 'paid',
      paymentMethod: workspace.subscription.paymentMethod
    }
  };
  if (!sameOrganisation) {
    next = {
      ...next,
      intervals: [],
      events: [],
      corrections: [],
      leave: [],
      leavePolicies: [],
      leaveOpenings: [],
      daySubmissions: {},
      exports: [],
      audit: [],
      notifications: [],
      feed: [],
      approverFor: {},
      projects: [generalProject(members, workspace.organisation.name)],
      employeeWorkOptions: { projects: [], tasks: [], categories: [] },
      employeeWorkOptionsLoading: false,
      balances: [
        { type: 'annual', available: null, used: 0, basis: 'employer', note: 'Set the allowance in leave settings. This is not a statutory balance.' },
        { type: 'sick', available: null, used: 0, basis: 'employer', note: 'Configurable by the employer.' },
        { type: 'family', available: null, used: 0, basis: 'employer', note: 'Configurable by the employer.' }
      ],
      session: { state: 'clocked_out', category: 'General administration', submitted: false }
    };
  }
  if (app === 'employer') {
    const role = workspace.user.role;
    const viewer = role === 'manager' || role === 'approver' ? role : 'owner';
    const pending = invitations.find((invite) => invite.status === 'pending');
    next = {
      ...next,
      viewerRole: viewer,
      viewerMemberId: workspace.user.id,
      employerAuthed: true,
      employerStack: [{ name: 'dashboard' }],
      employeeRoute: !state.employeeAuthed && pending ? { name: 'invite' } : state.employeeRoute,
      lastInviteId: pending?.id ?? state.lastInviteId
    };
  } else {
    const sameEmployee = state.orgId === workspace.organisation.id && state.employeeMemberId === workspace.user.id;
    next = {
      ...next,
      employeeAuthed: true,
      employeeIssue: null,
      employeeRoute: { name: 'day' },
      employeeMemberId: workspace.user.id,
      employeeWorkOptions: sameEmployee ? state.employeeWorkOptions : { projects: [], tasks: [], categories: [] },
      employeeWorkOptionsLoading: true,
      session: sameOrganisation ? state.session : { state: 'clocked_out', category: 'General administration', submitted: false }
    };
  }
  next.feed = [{ id: `f-live-${now}`, time: secToLabel(now), app, text: `Signed in to ${workspace.organisation.name}` }, ...next.feed].slice(0, 40);
  return next;
}
