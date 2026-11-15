import type { LeaveOpening, LeavePolicy, LeaveRequest, LeaveStatus } from '../types/time';
import { api } from './client';

interface LeaveSetupResponse {
  policies: LeavePolicy[];
  openings: LeaveOpening[];
  requests: {
    id: string;
    userId: string;
    leaveType: string;
    start: string;
    end: string;
    days: number;
    notes: string;
    status: string;
    decisionReason?: string | null;
    reviewerName?: string | null;
  }[];
}

const statuses = new Set<LeaveStatus>(['pending', 'approved', 'rejected', 'info_requested', 'withdrawn']);

function asStatus(value: string): LeaveStatus {
  return statuses.has(value as LeaveStatus) ? value as LeaveStatus : 'pending';
}

export async function loadLeaveSetup(token: string): Promise<{ policies: LeavePolicy[]; openings: LeaveOpening[]; requests: LeaveRequest[] }> {
  const data = await api<LeaveSetupResponse>('/api/leave/policy', { token });
  return {
    policies: data.policies ?? [],
    openings: data.openings ?? [],
    requests: (data.requests ?? []).map((row) => ({
      id: row.id,
      memberId: row.userId,
      type: row.leaveType,
      start: row.start,
      end: row.end,
      days: Number(row.days),
      portion: 'full',
      notes: row.notes ?? '',
      status: asStatus(row.status),
      submitted: row.start,
      reviewer: row.reviewerName ?? undefined,
      decisionReason: row.decisionReason ?? undefined
    }))
  };
}

export function saveLeavePolicies(token: string, policies: LeavePolicy[]) {
  return api<LeavePolicy[]>('/api/leave/policy', { method: 'PUT', token, body: { policies } });
}

export function saveLeaveOpening(token: string, opening: { policyId: string; userId: string; openingDays: number | null; asOf: string }) {
  return api<LeaveOpening | null>('/api/leave/openings', { method: 'PUT', token, body: opening });
}

export function submitLeaveRequest(token: string, body: { leaveType: string; start: string; end: string; days: number; notes: string }) {
  return api<{ id: string }>('/api/leave', { token, body });
}

export function reviewLeaveRequest(token: string, id: string, body: { decision: string; reason: string }) {
  return api('/api/leave/' + id + '/review', { token, body });
}
