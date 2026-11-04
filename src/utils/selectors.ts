import { THANDI_ID } from '../data/members';
import type { DemoState } from '../types/demo';
import type { Member, ViewerRole } from '../types/org';
import type { Interval } from '../types/time';
import { inScope } from './permissions';
import { TODAY, labelToSec, secToLabel } from './time';

export function actorId(s: DemoState): string {
  return s.employeeMemberId || THANDI_ID;
}

export function actorMember(s: DemoState): Member | undefined {
  return s.members.find((m) => m.id === actorId(s));
}

export function memberById(s: DemoState, id: string): Member | undefined {
  return s.members.find((m) => m.id === id);
}

/** Server-visible intervals (queued agent observations have not reached the server yet). */
export function intervalsFor(s: DemoState, memberId: string, date: string): Interval[] {
  return s.intervals.filter((i) => i.memberId === memberId && i.date === date && !i.queued).sort((a, b) => a.startSec - b.startSec);
}

export interface DayTotals {
  firstStart?: number;
  lastEnd?: number;
  attendance: number;
  work: number;
  breaks: number;
  idleUnresolved: number;
  idlePending: number;
  idleApproved: number;
  idleRejected: number;
  idleCount: number;
  unresolvedCount: number;
  approvedEstimate: number;
}

export function dayTotals(ivs: Interval[], now: number): DayTotals {
  const dur = (i: Interval) => Math.max(0, (i.endSec ?? now) - i.startSec);
  const main = ivs.filter((i) => i.type !== 'idle');
  const idle = ivs.filter((i) => i.type === 'idle');
  const sum = (arr: Interval[]) => arr.reduce((acc, i) => acc + dur(i), 0);
  const firstStart = main.length ? Math.min(...main.map((i) => i.startSec)) : undefined;
  const lastEnd = main.length ? Math.max(...main.map((i) => i.endSec ?? now)) : undefined;
  const work = sum(main.filter((i) => i.type === 'work'));
  const idleRejected = sum(idle.filter((i) => i.status === 'rejected'));
  return {
    firstStart,
    lastEnd,
    attendance: firstStart !== undefined && lastEnd !== undefined ? lastEnd - firstStart : 0,
    work,
    breaks: sum(main.filter((i) => i.type === 'break')),
    idleUnresolved: sum(idle.filter((i) => i.status === 'unclassified')),
    idlePending: sum(idle.filter((i) => i.status === 'awaiting_review' || i.status === 'info_requested')),
    idleApproved: sum(idle.filter((i) => i.status === 'approved')),
    idleRejected,
    idleCount: idle.length,
    unresolvedCount: idle.filter((i) => i.status === 'unclassified' || i.status === 'info_requested').length,
    approvedEstimate: Math.max(0, work - idleRejected)
  };
}

export function thandiLive(s: DemoState, base: Member, now: number): Member {
  const ivs = intervalsFor(s, actorId(s), TODAY);
  const tot = dayTotals(ivs, now);
  const se = s.session;
  const attendance =
  se.state === 'clocked_in' ? 'clocked_in' : se.state === 'on_break' ? 'on_break' : se.state === 'ended' ? 'clocked_out' : 'not_clocked_in';
  const p = s.projects.find((x) => x.id === se.projectId);
  const hasPending = s.corrections.some((c) => c.memberId === actorId(s) && c.date === TODAY && c.status === 'pending');
  return {
    ...base,
    attendance: hasPending && attendance !== 'on_break' ? 'pending_correction' : attendance,
    clockIn: tot.firstStart !== undefined ? secToLabel(tot.firstStart) : undefined,
    hoursToday: tot.work / 3600,
    breakNow: se.state === 'on_break' && se.breakStartSec !== undefined ? `${se.breakCategory} since ${secToLabel(se.breakStartSec)}` : undefined,
    unresolvedIdle: tot.unresolvedCount,
    currentTask: se.state === 'clocked_in' || se.state === 'on_break' ? p?.name ?? se.category : undefined
  };
}

/** Active members with Thandi's live session applied. Others use their static demo status. */
export function liveMembers(s: DemoState, now: number, includeInactive = false): Member[] {
  return s.members.
  filter((m) => includeInactive || m.status === 'active').
  map((m) => m.id === actorId(s) ? thandiLive(s, m, now) : m);
}

export function memberDayIntervals(s: DemoState, m: Member, now: number): Interval[] {
  const ivs = intervalsFor(s, m.id, TODAY);
  if (ivs.length || m.id === actorId(s) || !m.clockIn || m.attendance === 'missing_clock_out') return ivs;
  const start = labelToSec(m.clockIn);
  const end = m.attendance === 'clocked_out' ? start + Math.round(m.hoursToday * 3600) : undefined;
  if (start > now) return [];
  return [{ id: `syn-${m.id}`, memberId: m.id, date: TODAY, type: 'work', startSec: start, endSec: end, status: 'recorded', source: 'browser' }];
}

export function pendingCorrections(s: DemoState, role: ViewerRole) {
  return s.corrections.filter((c) => (c.status === 'pending' || c.status === 'submitted') && inScope(role, c.memberId));
}

export function pendingLeave(s: DemoState, role: ViewerRole) {
  return s.leave.filter((l) => l.status === 'pending' && inScope(role, l.memberId));
}

export function projectName(s: DemoState, id?: string): string | undefined {
  return s.projects.find((p) => p.id === id)?.name;
}

export function taskName(s: DemoState, pid?: string, tid?: string): string | undefined {
  return s.projects.find((p) => p.id === pid)?.tasks.find((t) => t.id === tid)?.name;
}