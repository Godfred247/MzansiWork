import type { TimeEvent } from './time';

export type AgentConnection =
'online' |
'offline' |
'syncing' |
'sync_failed' |
'session_expired' |
'storage_error';

export type AgentScreen = 'welcome' | 'signin' | 'main' | 'timeline' | 'idle' | 'settings';
export type AgentSettingsTab = 'account' | 'tracking' | 'notifications' | 'sync' | 'about';

export interface AgentState {
  firstRunDone: boolean;
  signedIn: boolean;
  screen: AgentScreen;
  connection: AgentConnection;
  queue: TimeEvent[];
  lastSyncSec: number;
  idleOpenId?: string;
  updateAvailable: boolean;
  notifications: boolean;
  paused: boolean;
  settingsTab: AgentSettingsTab;
  lastSyncResult?: {ok: boolean;sent: number;duplicates: number;};
}