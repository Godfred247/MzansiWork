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

export function viewerName(role: ViewerRole): string {
  return role === 'owner' ? 'Lerato Mokoena' : role === 'manager' ? 'Pieter van Wyk' : 'Nomsa Khumalo';
}

/** The person who is signed in. Sample flows keep the Karoo names; a real organisation uses its own people. */
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