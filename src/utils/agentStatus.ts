import type { DemoState } from '../types/demo';

export type AgentStatusKey =
'not_signed_in' |
'not_tracking' |
'tracking' |
'on_break' |
'idle' |
'awaiting_classification' |
'syncing' |
'offline' |
'sync_failed' |
'session_expired' |
'error' |
'update';

export interface AgentStatus {
  key: AgentStatusKey;
  label: string;
  detail: string;
  dot: string;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

export function deriveAgentStatus(s: DemoState): AgentStatus {
  const a = s.agent;
  if (!a.signedIn) return { key: 'not_signed_in', label: 'Not signed in', detail: 'Nothing is recorded until you sign in.', dot: 'bg-subtle', tone: 'neutral' };
  if (a.connection === 'session_expired') return { key: 'session_expired', label: 'Sign-in required', detail: 'Your session expired. Observations are paused until you sign in again.', dot: 'bg-danger', tone: 'danger' };
  if (a.connection === 'storage_error') return { key: 'error', label: 'Needs attention', detail: 'The agent cannot save events on this computer.', dot: 'bg-danger', tone: 'danger' };
  if (a.idleOpenId) return { key: 'idle', label: 'Idle interval detected', detail: 'No input reached the configured threshold. This is an observation, not a judgement.', dot: 'bg-warning-fill', tone: 'warning' };
  if (a.connection === 'offline') return { key: 'offline', label: 'Offline: events saved locally', detail: `${a.queue.length} event${a.queue.length === 1 ? '' : 's'} waiting to sync. Nothing has reached the server yet.`, dot: 'bg-warning-fill', tone: 'warning' };
  if (a.connection === 'syncing') return { key: 'syncing', label: 'Synchronising…', detail: 'Sending saved events to MzansiWork.', dot: 'bg-[#38BDF8]', tone: 'info' };
  if (a.connection === 'sync_failed') return { key: 'sync_failed', label: 'Sync failed', detail: `${a.queue.length} events are kept safely on this computer. Retry when ready.`, dot: 'bg-danger', tone: 'danger' };
  if (a.paused && s.session.state === 'clocked_in') return { key: 'not_tracking', label: 'Observations paused', detail: 'Your work session continues, but idle/active times are not being observed. Resume any time.', dot: 'bg-subtle', tone: 'neutral' };
  if (s.session.state === 'on_break') return { key: 'on_break', label: 'On a recorded break', detail: `${s.session.breakCategory ?? 'Break'} — idle detection paused.`, dot: 'bg-[#38BDF8]', tone: 'info' };
  if (s.session.state === 'clocked_in') return { key: 'tracking', label: 'Tracking active', detail: 'Idle/active transitions are observed during this work session.', dot: 'bg-[#4ADE80]', tone: 'success' };
  return { key: 'not_tracking', label: 'Signed in · not tracking', detail: 'No work session is active. Nothing is being observed.', dot: 'bg-subtle', tone: 'neutral' };
}