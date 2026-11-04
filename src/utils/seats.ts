import type { Subscription } from '../types/billing';
import type { Invitation, Member } from '../types/org';
import { planLimit } from './pricing';

export interface SeatUsage {
  limit: number;
  active: number;
  reserved: number;
  available: number;
  used: number;
}

export function seatUsage(s: {members: Member[];invitations: Invitation[];subscription: Subscription;}): SeatUsage {
  const limit = planLimit(s.subscription.planId, s.subscription.enterpriseUsers);
  const active = s.members.filter((m) => m.status === 'active').length;
  const reserved = s.invitations.filter((i) => i.status === 'pending').length;
  return { limit, active, reserved, used: active + reserved, available: Math.max(0, limit - active - reserved) };
}

export type InviteCheck =
{ok: true;} |
{ok: false;reason: 'invalid' | 'duplicate' | 'member' | 'no_seats';message: string;};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function checkInvite(
email: string,
s: {members: Member[];invitations: Invitation[];subscription: Subscription;})
: InviteCheck {
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return { ok: false, reason: 'invalid', message: 'Enter a valid work email address, e.g. name@company.co.za.' };
  if (s.members.some((m) => m.email.toLowerCase() === e && m.status === 'active'))
  return { ok: false, reason: 'member', message: 'This person already belongs to your organisation. No invitation is needed.' };
  if (s.invitations.some((i) => i.email.toLowerCase() === e && i.status === 'pending'))
  return { ok: false, reason: 'duplicate', message: 'An invitation to this email is already pending. You can resend it instead — it will not use another seat.' };
  if (seatUsage(s).available <= 0)
  return { ok: false, reason: 'no_seats', message: 'All seats on your plan are in use or reserved by pending invitations.' };
  return { ok: true };
}