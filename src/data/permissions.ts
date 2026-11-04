import type { Role } from '../types/org';

export type Capability =
'view_org_attendance' |
'manage_employees' |
'invite' |
'approve_corrections' |
'approve_leave' |
'view_activity' |
'view_reports' |
'export' |
'manage_policy' |
'manage_roles' |
'view_audit' |
'billing';

export type Access = 'yes' | 'scoped' | 'own' | 'grant' | 'no';

export const capabilities: {id: Capability;label: string;}[] = [
{ id: 'view_org_attendance', label: 'View attendance' },
{ id: 'manage_employees', label: 'Manage employee records' },
{ id: 'invite', label: 'Invite employees' },
{ id: 'approve_corrections', label: 'Approve corrections' },
{ id: 'approve_leave', label: 'Approve leave' },
{ id: 'view_activity', label: 'View activity observations' },
{ id: 'view_reports', label: 'View reports' },
{ id: 'export', label: 'Export data' },
{ id: 'manage_policy', label: 'Configure tracking policy' },
{ id: 'manage_roles', label: 'Assign roles & permissions' },
{ id: 'view_audit', label: 'View audit history' },
{ id: 'billing', label: 'Subscription & billing' }];


export const permissionMatrix: Record<Role, Record<Capability, Access>> = {
  owner: { view_org_attendance: 'yes', manage_employees: 'yes', invite: 'yes', approve_corrections: 'yes', approve_leave: 'yes', view_activity: 'yes', view_reports: 'yes', export: 'yes', manage_policy: 'yes', manage_roles: 'yes', view_audit: 'yes', billing: 'yes' },
  manager: { view_org_attendance: 'scoped', manage_employees: 'scoped', invite: 'grant', approve_corrections: 'scoped', approve_leave: 'scoped', view_activity: 'scoped', view_reports: 'scoped', export: 'grant', manage_policy: 'no', manage_roles: 'no', view_audit: 'scoped', billing: 'grant' },
  approver: { view_org_attendance: 'scoped', manage_employees: 'no', invite: 'no', approve_corrections: 'scoped', approve_leave: 'scoped', view_activity: 'scoped', view_reports: 'no', export: 'no', manage_policy: 'no', manage_roles: 'no', view_audit: 'no', billing: 'no' },
  employee: { view_org_attendance: 'own', manage_employees: 'no', invite: 'no', approve_corrections: 'no', approve_leave: 'no', view_activity: 'own', view_reports: 'own', export: 'own', manage_policy: 'no', manage_roles: 'no', view_audit: 'no', billing: 'no' }
};

export const accessLegend: Record<Access, string> = {
  yes: 'Full access',
  scoped: 'Assigned team / branch only',
  own: 'Own records only',
  grant: 'Only if explicitly granted by the owner',
  no: 'No access'
};

/** Demo grants for the prototype's manager (Pieter): invite + export granted, billing NOT granted. */
export const managerGrants: Capability[] = ['invite', 'export'];
export const approverScope = { team: 'Design', members: ['m-thandi', 'm-lindiwe'], until: '2026-11-30', delegatedBy: 'Lerato Mokoena' };