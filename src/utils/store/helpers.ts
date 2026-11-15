import { THANDI_ID } from '../../data/members';
import type { DemoState } from '../../types/demo';
import type { AppId, AuditEntry, Tone } from '../../types/org';
import type { EventKind, EventSource, Interval, TimeEvent } from '../../types/time';
import { currentWorkDate } from '../selectors';
import { TODAY, secToLabel } from '../time';

let counter = 0;
export const uid = (p: string) => `${p}-${(++counter).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function addToast(s: DemoState, app: AppId, message: string, tone: Tone = 'success'): DemoState {
  return { ...s, toasts: [...s.toasts.filter((t) => t.app !== app).slice(-4), { id: uid('t'), app, message, tone }] };
}

export function addFeed(s: DemoState, app: AppId, text: string, now: number): DemoState {
  return { ...s, feed: [{ id: uid('f'), time: secToLabel(now), app, text }, ...s.feed].slice(0, 40) };
}

export function addAudit(s: DemoState, e: Omit<AuditEntry, 'id' | 'date' | 'time'>, now: number): DemoState {
  return { ...s, audit: [{ ...e, id: uid('a'), date: currentWorkDate(s), time: secToLabel(now) }, ...s.audit] };
}

export function notify(s: DemoState, app: 'employer' | 'employee', title: string, body: string, tone: Tone, now: number): DemoState {
  return {
    ...s,
    notifications: [{ id: uid('n'), app, title, body, tone, date: currentWorkDate(s), time: secToLabel(now), read: false }, ...s.notifications]
  };
}

export function makeEvent(kind: EventKind, now: number, source: EventSource, detail: string, synced = true, memberId = THANDI_ID, date = TODAY): TimeEvent {
  return { id: uid('ev'), memberId, date, sec: now, kind, source, detail, synced };
}

export function addEvent(s: DemoState, kind: EventKind, now: number, source: EventSource, detail: string): DemoState {
  return { ...s, events: [...s.events, makeEvent(kind, now, source, detail, true, s.employeeMemberId || THANDI_ID, currentWorkDate(s))] };
}

export function patchInterval(s: DemoState, id: string | undefined, patch: Partial<Interval>): DemoState {
  if (!id) return s;
  return { ...s, intervals: s.intervals.map((i) => i.id === id ? { ...i, ...patch } : i) };
}

export function closeInterval(s: DemoState, id: string | undefined, endSec: number): DemoState {
  return patchInterval(s, id, { endSec });
}