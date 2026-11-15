import { approverScope, managerGrants, permissionMatrix } from '../data/permissions';
import type { Capability } from '../data/permissions';
import type { DemoState } from '../types/demo';
import type { ViewerRole } from '../types/org';
import { isLiveOrg } from './workspace';

export function can(role: ViewerRole, cap: Capability): boolean {
  const access = permissionMatrix[role][cap];
  if (access === 'yes' || access === 'scoped') return true;
  if (access === 'grant') return role === 'manager' && managerGrants.includes(cap);
  return false;
}

export function inScope(role: ViewerRole, memberId: string): boolean {
  if (role === 'approver') return approverScope.members.includes(memberId);
  return true;
}

export function seesMember(state: DemoState, memberId: string): boolean {
  if (state.approverFor?.[memberId] && actingMemberId(state) === state.approverFor[memberId]) return true;
  return inScope(state.viewerRole, memberId);
}

function actingMemberId(state: Pick<DemoState, 'orgId' | 'flow' | 'viewerRole' | 'viewerMemberId'>): string {
  if (isLiveOrg(state.orgId) && !state.flow) return state.viewerMemberId;
  if (state.viewerRole === 'manager') return 'm-pieter';
  if (state.viewerRole === 'approver') return 'm-nomsa';
  return state.viewerMemberId || 'm-lerato';
}

/** The owner can always decide. A chosen person can decide for that employee. A manager is not assigned unless the owner picks them. */
export function mayApprove(state: DemoState, memberId: string, kind: 'approve_leave' | 'approve_corrections'): boolean {
  if (state.viewerRole === 'owner') return true;
  const assigned = state.approverFor?.[memberId];
  if (assigned) return actingMemberId(state) === assigned;
  if (isLiveOrg(state.orgId) && !state.flow) return false;
  return can(state.viewerRole, kind) && inScope(state.viewerRole, memberId);
}

export function viewerName(role: ViewerRole): string {
  return role === 'owner' ? 'Lerato Mokoena' : role === 'manager' ? 'Pieter van Wyk' : 'Nomsa Khumalo';
}

/** The person who is signed in. Sample flows use the demo names; a real organisation uses its own people. */
export function signedInName(state: Pick<DemoState, 'orgId' | 'viewerRole' | 'viewerMemberId' | 'members'>): string {
  if (isLiveOrg(state.orgId)) {
    const person = state.members.find((member) => member.id === state.viewerMemberId) ?? state.members.find((member) => member.role === 'owner');
    if (person?.name) return person.name;
  }
  return viewerName(state.viewerRole);
}

export function viewerRoleLabel(role: ViewerRole): string {
  return role === 'owner' ? 'Owner' : role === 'manager' ? 'Manager' : 'Delegated approver';
}