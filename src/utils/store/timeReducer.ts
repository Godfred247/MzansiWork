import { THANDI_ID } from '../../data/members';
import { trackingPolicy } from '../../data/policy';
import type { StampedAction } from '../../types/actions';
import type { DemoState } from '../../types/demo';
import type { EventKind, Interval } from '../../types/time';
import { fmtDate, fmtDur, range, secToLabel } from '../time';
import { currentWorkDate } from '../selectors';
import { viewerName } from '../permissions';
import { addAudit, addEvent, addFeed, addToast, closeInterval, makeEvent, notify, patchInterval, uid } from './helpers';

export function taskText(s: DemoState, pid?: string, tid?: string, cat?: string): string {
  const p = s.projects.find((x) => x.id === pid);
  const t = p?.tasks.find((x) => x.id === tid);
  if (p && t) return `${p.name} · ${t.name}`;
  const personalProject = s.employeeWorkOptions.projects.find((x) => x.id === pid);
  const personalTask = s.employeeWorkOptions.tasks.find((x) => x.id === tid);
  if (personalTask) return `${p?.name ?? personalProject?.name ?? 'Project'} · ${personalTask.name}`;
  if (p) return p.name;
  if (personalProject) return personalProject.name;
  return cat || 'No task selected';
}

function workInterval(memberId: string, id: string, now: number, date: string, pid?: string, tid?: string, cat?: string): Interval {
  return { id, memberId, date, type: 'work', startSec: now, projectId: pid, taskId: tid, category: cat, status: 'recorded', source: 'browser' };
}

function agentEvent(s: DemoState, kind: EventKind, now: number, detail: string, duplicate = false): DemoState {
  const offline = s.agent.connection !== 'online';
  const ev = makeEvent(kind, now, 'agent', detail, !offline, s.employeeMemberId || THANDI_ID, currentWorkDate(s));
  if (!offline) return { ...s, events: [...s.events, ev] };
  return { ...s, agent: { ...s.agent, queue: duplicate ? [...s.agent.queue, ev, ev] : [...s.agent.queue, ev] } };
}

export function timeReducer(s: DemoState, a: StampedAction): DemoState | null {
  const T = s.employeeMemberId || THANDI_ID;
  const who = s.members.find((m) => m.id === T)?.name ?? 'Employee';
  const first = who.split(' ')[0];
  const now = a.now;
  const today = currentWorkDate(s);
  const t = secToLabel(now);
  const se = s.session;
  switch (a.type) {
    case 'CLOCK_IN':{
        if (se.state === 'clocked_in' || se.state === 'on_break')
        return addToast(s, 'employee', 'You are already clocked in — no duplicate record was created.', 'warning');
        const id = uid('iv');
        let n: DemoState = {
          ...s,
          session: { state: 'clocked_in', clockInSec: now, projectId: a.projectId, taskId: a.taskId, category: a.category, submitted: false, workIntervalId: id },
          intervals: [...s.intervals, workInterval(T, id, now, today, a.projectId, a.taskId, a.category)],
          daySubmissions: { ...s.daySubmissions, [today]: 'open' }
        };
        n = addEvent(n, 'clock_in', now, 'browser', `Clocked in · ${taskText(n, a.projectId, a.taskId, a.category)}`);
        n = addFeed(n, 'employee', `${first} clocked in at ${t} → employer dashboard shows “Clocked in”`, now);
        if (n.agent.signedIn) n = addToast(n, 'agent', 'Tracking active — work session started in the portal', 'info');
        return addToast(n, 'employee', `Clocked in at ${t}`, 'success');
      }
    case 'SWITCH_TASK':{
        if (se.state !== 'clocked_in') return addToast(s, 'employee', 'End your break before switching task.', 'warning');
        const id = uid('iv');
        let n = closeInterval(s, se.workIntervalId, now);
        n = {
          ...n,
          session: { ...se, projectId: a.projectId, taskId: a.taskId, category: a.category, workIntervalId: id },
          intervals: [...n.intervals, workInterval(T, id, now, today, a.projectId, a.taskId, a.category)]
        };
        n = addEvent(n, 'task_switch', now, 'browser', `Switched to ${taskText(n, a.projectId, a.taskId, a.category)}`);
        return addToast(n, 'employee', 'Task switched', 'success');
      }
    case 'START_BREAK':{
        if (se.state === 'on_break') return addToast(s, 'employee', 'A break is already running. End it before starting another.', 'warning');
        if (se.state !== 'clocked_in') return addToast(s, 'employee', 'Clock in before starting a break.', 'warning');
        const id = uid('iv');
        let n = closeInterval(s, se.workIntervalId, now);
        n = {
          ...n,
          session: { ...se, state: 'on_break', breakStartSec: now, breakCategory: a.category, breakIntervalId: id, workIntervalId: undefined },
          intervals: [...n.intervals, { id, memberId: T, date: today, type: 'break', startSec: now, breakCategory: a.category, status: 'recorded', source: 'browser' }]
        };
        n = addEvent(n, 'break_start', now, 'browser', `${a.category} started`);
        n = addFeed(n, 'employee', `${first} started a ${a.category.toLowerCase()} → shown as “On break” to employer and agent`, now);
        if (n.agent.signedIn) n = addToast(n, 'agent', `On a recorded break · ${a.category}`, 'info');
        return addToast(n, 'employee', `${a.category} started at ${t}`, 'info');
      }
    case 'END_BREAK':{
        if (se.state !== 'on_break') return addToast(s, 'employee', 'No break is running.', 'warning');
        const id = uid('iv');
        const dur = now - (se.breakStartSec ?? now);
        let n = closeInterval(s, se.breakIntervalId, now);
        n = {
          ...n,
          session: { ...se, state: 'clocked_in', breakStartSec: undefined, breakCategory: undefined, breakIntervalId: undefined, workIntervalId: id },
          intervals: [...n.intervals, workInterval(T, id, now, today, se.projectId, se.taskId, se.category)]
        };
        n = addEvent(n, 'break_end', now, 'browser', `${se.breakCategory} ended · ${fmtDur(dur)}`);
        n = addFeed(n, 'employee', `${first} ended break (${fmtDur(dur)})`, now);
        if (n.agent.signedIn) n = addToast(n, 'agent', 'Break ended — tracking active', 'info');
        return addToast(n, 'employee', `Break ended · ${fmtDur(dur)} recorded`, 'success');
      }
    case 'CLOCK_OUT':{
        if (se.state !== 'clocked_in' && se.state !== 'on_break') return addToast(s, 'employee', 'You are not clocked in.', 'warning');
        let n = s;
        if (se.breakIntervalId) {
          n = closeInterval(n, se.breakIntervalId, now);
          n = addEvent(n, 'break_end', now, 'browser', `${se.breakCategory} ended at clock-out`);
        }
        if (se.workIntervalId) n = closeInterval(n, se.workIntervalId, now);
        if (n.agent.idleOpenId) {
          n = closeInterval(n, n.agent.idleOpenId, now);
          n = { ...n, agent: { ...n.agent, idleOpenId: undefined, screen: n.agent.screen === 'idle' ? 'main' : n.agent.screen } };
        }
        n = { ...n, session: { ...se, state: 'ended', clockOutSec: now, breakIntervalId: undefined, workIntervalId: undefined, breakStartSec: undefined, breakCategory: undefined } };
        n = addEvent(n, 'clock_out', now, 'browser', 'Clocked out');
        n = addFeed(n, 'employee', `${first} clocked out at ${t}`, now);
        if (n.agent.signedIn) n = addToast(n, 'agent', 'Session ended — tracking stopped', 'neutral');
        return n;
      }
    case 'UNDO_CLOCK_OUT':{
        if (se.state !== 'ended' || se.clockOutSec === undefined || now - se.clockOutSec > 600)
        return addToast(s, 'employee', 'Clock-out can only be reversed within 10 minutes. Submit a correction instead.', 'warning');
        const id = uid('iv');
        let n: DemoState = {
          ...s,
          session: { ...se, state: 'clocked_in', clockOutSec: undefined, workIntervalId: id, submitted: false },
          intervals: [...s.intervals, workInterval(T, id, se.clockOutSec, today, se.projectId, se.taskId, se.category)]
        };
        n = addEvent(n, 'clock_out_reversed', now, 'browser', `Accidental clock-out at ${secToLabel(se.clockOutSec)} reversed — original event kept`);
        n = addAudit(n, { actor: who, action: 'Reversed accidental clock-out', target: `Timesheet ${fmtDate(today, 'd MMM')}`, reason: 'Within 10-minute self-service window', category: 'attendance' }, now);
        return addToast(n, 'employee', 'Clock-out reversed. Your session continues.', 'success');
      }
    case 'SUBMIT_DAY':{
        let n: DemoState = { ...s, session: { ...se, submitted: true }, daySubmissions: { ...s.daySubmissions, [today]: 'submitted' } };
        n = notify(n, 'employer', `Timesheet submitted: ${who}`, `Mon 26 Oct submitted for review.`, 'info', now);
        n = addAudit(n, { actor: who, action: 'Submitted day for review', target: 'Timesheet 26 Oct', category: 'attendance' }, now);
        n = addFeed(n, 'employee', `${first} submitted today’s timesheet → employer notified`, now);
        return addToast(n, 'employee', 'Day submitted for review', 'success');
      }
    case 'AGENT_IDLE_START':{
        if (se.state !== 'clocked_in') return addToast(s, 'agent', 'Idle detection only runs during an active work session.', 'warning');
        if (s.agent.paused) return addToast(s, 'agent', 'Observations are paused — nothing is recorded.', 'warning');
        if (s.agent.idleOpenId) return s;
        const offline = s.agent.connection !== 'online';
        const id = uid('iv');
        const start = now - trackingPolicy.idleThresholdMin * 60;
        let n: DemoState = {
          ...s,
          intervals: [...s.intervals, { id, memberId: T, date: today, type: 'idle', startSec: start, status: 'unclassified', source: 'agent', queued: offline }],
          agent: { ...s.agent, idleOpenId: id, screen: 'idle' }
        };
        n = agentEvent(n, 'idle_start', start, `No input for ${trackingPolicy.idleThresholdMin} min — idle threshold reached at ${t}`);
        return addFeed(n, 'agent', `Agent: OS idle threshold reached (idle since ${secToLabel(start)})${offline ? ' · saved locally' : ''}`, now);
      }
    case 'AGENT_IDLE_END':{
        const id = s.agent.idleOpenId;
        if (!id) return s;
        const offline = s.agent.connection !== 'online';
        let n = closeInterval(s, id, now);
        const iv = n.intervals.find((i) => i.id === id) as Interval;
        n = { ...n, agent: { ...n.agent, idleOpenId: undefined, screen: 'main' } };
        n = agentEvent(n, 'active_resumed', now, 'Input resumed — active state', offline);
        const label = `${range(iv.startSec, now)} (${fmtDur(now - iv.startSec)})`;
        n = addFeed(n, 'agent', `Agent recorded idle ${label}${offline ? ' — queued locally, not yet on server' : ` → visible in ${first}’s activity timeline`}`, now);
        if (offline) return addToast(n, 'agent', 'Active again. Interval saved locally — it will sync when online.', 'warning');
        n = notify(n, 'employee', 'An interval is ready to review', `${label} was observed by the desktop agent. If it was work, you can add an explanation.`, 'info', now);
        n = addToast(n, 'employee', `New idle interval to review · ${fmtDur(now - iv.startSec)}`, 'info');
        return addToast(n, 'agent', 'Active again. Interval saved — review it whenever suits you.', 'info');
      }
    case 'AGENT_SYNC_DONE':{
        if (!a.ok) {
          const n = { ...s, agent: { ...s.agent, connection: 'sync_failed' as const, lastSyncResult: { ok: false, sent: 0, duplicates: 0 } } };
          return addToast(n, 'agent', `Sync failed — ${s.agent.queue.length} events kept on this computer`, 'danger');
        }
        const unique = Array.from(new Map(s.agent.queue.map((e) => [e.id, e])).values());
        const dup = s.agent.queue.length - unique.length;
        const hadQueuedIdle = s.intervals.some((i) => i.queued);
        let n: DemoState = {
          ...s,
          events: [...s.events, ...unique.map((e) => ({ ...e, synced: true }))],
          intervals: s.intervals.map((i) => i.queued ? { ...i, queued: false } : i),
          agent: { ...s.agent, queue: [], connection: 'online', lastSyncSec: now, lastSyncResult: { ok: true, sent: unique.length, duplicates: dup } }
        };
        n = addFeed(n, 'agent', `Agent synced ${unique.length} event${unique.length === 1 ? '' : 's'}${dup ? ` · ${dup} duplicate skipped` : ''}`, now);
        if (hadQueuedIdle) {
          n = notify(n, 'employee', 'An interval is ready to review', 'An idle interval recorded while offline has now synchronised.', 'info', now);
          n = addToast(n, 'employee', 'Offline interval synchronised — ready to review', 'info');
        }
        return addToast(n, 'agent', `Synchronised · ${unique.length} sent${dup ? `, ${dup} duplicate skipped` : ''}`, 'success');
      }
    case 'SUBMIT_CORRECTION':{
        const p = a.payload;
        const id = uid('c');
        let n: DemoState = {
          ...s,
          corrections: [
          {
            id, memberId: T, date: p.date, kind: p.kind, intervalId: p.intervalId, original: p.original, requested: p.requested, classification: p.classification,
            reason: p.reason, notes: p.notes, status: 'pending', source: p.source, durationSec: p.durationSec, projectId: se.projectId,
            history: [
            { date: today, time: t, actor: who, status: 'submitted', note: p.source === 'agent' ? 'Submitted from desktop agent' : undefined },
            { date: today, time: t, actor: 'System', status: 'pending', note: 'Routed to Pieter van Wyk' }]

          },
          ...s.corrections]

        };
        if (p.intervalId) n = patchInterval(n, p.intervalId, { status: 'awaiting_review', correctionId: id });
        n = addEvent(n, 'correction_submitted', now, p.source === 'agent' ? 'agent' : 'browser', `Explanation submitted: ${p.classification ?? p.requested}`);
        n = notify(n, 'employer', `Correction request from ${who}`, `${p.original} → ${p.requested}`, 'warning', now);
        n = addAudit(n, { actor: who, action: 'Submitted correction request', target: p.original, category: 'correction' }, now);
        n = addFeed(n, p.source === 'agent' ? 'agent' : 'employee', `${first} explained an interval → Approvals inbox +1 on employer app`, now);
        if (p.source === 'agent') n = addToast(n, 'agent', 'Explanation sent for review', 'success');
        return addToast(n, 'employee', 'Explanation submitted — awaiting review. The original observation is kept.', 'success');
      }
    case 'WITHDRAW_CORRECTION':{
        const c = s.corrections.find((x) => x.id === a.id);
        if (!c) return s;
        let n: DemoState = {
          ...s,
          corrections: s.corrections.map((x) => x.id === a.id ? { ...x, status: 'withdrawn', history: [...x.history, { date: today, time: t, actor: who, status: 'withdrawn' }] } : x)
        };
        if (c.intervalId) n = patchInterval(n, c.intervalId, { status: 'unclassified', correctionId: undefined });
        n = addAudit(n, { actor: who, action: 'Withdrew correction request', target: c.original, category: 'correction' }, now);
        return addToast(n, 'employee', 'Request withdrawn', 'neutral');
      }
    case 'REVIEW_CORRECTION':{
        const c = s.corrections.find((x) => x.id === a.id);
        if (!c) return s;
        const reviewer = viewerName(s.viewerRole);
        let n: DemoState = {
          ...s,
          corrections: s.corrections.map((x) =>
          x.id === a.id ?
          { ...x, status: a.decision, reviewer, decisionReason: a.reason || undefined, history: [...x.history, { date: today, time: t, actor: reviewer, status: a.decision, note: a.reason || undefined }] } :
          x
          )
        };
        if (c.intervalId) {
          n = patchInterval(n, c.intervalId, {
            status: a.decision === 'approved' ? 'approved' : a.decision === 'rejected' ? 'rejected' : 'info_requested',
            classification: a.decision === 'approved' ? c.classification : undefined
          });
        }
        const member = s.members.find((m) => m.id === c.memberId);
        const verb = a.decision === 'approved' ? 'Approved' : a.decision === 'rejected' ? 'Rejected' : 'Requested more information on';
        n = addAudit(n, { actor: reviewer, action: `${verb} correction`, target: `${member?.name ?? ''} · ${c.original}`, reason: a.reason || undefined, category: 'correction' }, now);
        n = addFeed(n, 'employer', `${reviewer} ${verb.toLowerCase()} ${member?.name.split(' ')[0]}’s correction`, now);
        if (c.memberId === T) {
          const title = a.decision === 'approved' ? 'Correction approved' : a.decision === 'rejected' ? 'Correction not approved' : 'More information requested';
          n = notify(n, 'employee', title, `${c.original}${a.reason ? ` — “${a.reason}”` : ''} (${reviewer})`, a.decision === 'approved' ? 'success' : a.decision === 'rejected' ? 'danger' : 'info', now);
          n = addToast(n, 'employee', `${title} by ${reviewer}`, a.decision === 'approved' ? 'success' : a.decision === 'rejected' ? 'danger' : 'info');
        }
        return addToast(n, 'employer', `${verb} · employee notified`, 'success');
      }
    case 'RESPOND_INFO':{
        const c = s.corrections.find((x) => x.id === a.id);
        if (!c) return s;
        let n: DemoState = {
          ...s,
          corrections: s.corrections.map((x) =>
          x.id === a.id ? { ...x, status: 'pending', history: [...x.history, { date: today, time: t, actor: who, status: 'pending', note: a.note }] } : x
          )
        };
        if (c.intervalId) n = patchInterval(n, c.intervalId, { status: 'awaiting_review' });
        n = notify(n, 'employer', `${first} replied to your question`, a.note, 'info', now);
        return addToast(n, 'employee', 'Reply sent — back in review', 'success');
      }
  }
  return null;
}