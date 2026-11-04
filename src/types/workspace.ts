import type { Frequency, PlanId } from './billing';
import type { Role } from './org';

export interface WorkspacePerson {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  department: string;
  branch: string;
  status: string;
  billingAccess: boolean;
}

export interface WorkspaceInvite {
  id: string;
  email: string;
  role: Role;
  department: string;
  branch: string;
  status: string;
  sentAt: string;
  expiresAt: string;
}

export interface WorkspaceSnapshot {
  organisation: {
    id: string;
    name: string;
    timezone: string;
    contact: string;
    workingWeek: string;
    standardHours: string;
  };
  people: WorkspacePerson[];
  invitations: WorkspaceInvite[];
  subscription: {
    planId: PlanId;
    frequency: Frequency;
    enterpriseUsers: number;
    renewal: string;
    paymentStatus: 'paid' | 'failed';
    paymentMethod: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    department: string;
    billingAccess: boolean;
  };
}
