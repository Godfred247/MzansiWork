import type { AttendanceStatus, InviteStatus, Tone } from '../types/org';
import type { CorrectionStatus, IntervalStatus, LeaveStatus, LeaveType } from '../types/time';

type L = {label: string;tone: Tone;};

export const attendanceLabels: Record<AttendanceStatus, L> = {
  not_clocked_in: { label: 'Not clocked in', tone: 'neutral' },
  clocked_in: { label: 'Clocked in', tone: 'success' },
  on_break: { label: 'On break', tone: 'info' },
  clocked_out: { label: 'Clocked out', tone: 'neutral' },
  late: { label: 'Late', tone: 'warning' },
  missing_clock_out: { label: 'Missing clock-out', tone: 'danger' },
  pending_correction: { label: 'Pending correction', tone: 'warning' },
  requires_review: { label: 'Requires review', tone: 'warning' },
  on_leave: { label: 'On leave', tone: 'primary' },
  day_off: { label: 'Not scheduled', tone: 'neutral' }
};

export const correctionLabels: Record<CorrectionStatus, L> = {
  draft: { label: 'Draft', tone: 'neutral' },
  submitted: { label: 'Submitted', tone: 'info' },
  pending: { label: 'Pending review', tone: 'warning' },
  info_requested: { label: 'More info requested', tone: 'info' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  withdrawn: { label: 'Withdrawn', tone: 'neutral' }
};

export const leaveLabels: Record<LeaveStatus, L> = {
  pending: { label: 'Pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  info_requested: { label: 'More info requested', tone: 'info' },
  withdrawn: { label: 'Withdrawn', tone: 'neutral' }
};

export const inviteLabels: Record<InviteStatus, L> = {
  pending: { label: 'Pending', tone: 'warning' },
  accepted: { label: 'Accepted', tone: 'success' },
  expired: { label: 'Expired', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  failed: { label: 'Failed', tone: 'danger' }
};

export const intervalLabels: Record<IntervalStatus, L> = {
  recorded: { label: 'Recorded', tone: 'neutral' },
  unclassified: { label: 'Unclassified', tone: 'warning' },
  awaiting_review: { label: 'Awaiting review', tone: 'warning' },
  info_requested: { label: 'More info requested', tone: 'info' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Not accepted', tone: 'danger' }
};

export const leaveTypeLabels: Record<LeaveType, string> = {
  annual: 'Annual leave',
  sick: 'Sick leave',
  family: 'Family responsibility leave',
  parental: 'Parental leave',
  adoption: 'Adoption leave',
  commissioning: 'Commissioning parental leave',
  unpaid: 'Unpaid leave',
  study: 'Study leave (employer benefit)'
};