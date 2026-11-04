import React from 'react';
import { motion } from 'framer-motion';
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CloudOffIcon,
  CoffeeIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ListIcon,
  Loader2Icon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  RefreshCwIcon,
  SettingsIcon,
  WifiIcon } from
'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Avatar } from '../../components/shared/Avatar';
import { Button } from '../../components/shared/Button';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { brand } from '../../data/brand';
import { actorId, actorMember } from '../../utils/selectors';
import { trackingPolicy } from '../../data/policy';
import { deriveAgentStatus } from '../../utils/agentStatus';
import { taskText } from '../../utils/store/timeReducer';
import { fmtClock, fmtDur, secToLabel } from '../../utils/time';

const toneCls = {
  success: 'bg-[#14532D]/40 ring-[#4ADE80]/30 text-[#86EFAC]',
  info: 'bg-[#0C4A6E]/40 ring-[#38BDF8]/30 text-[#7DD3FC]',
  warning: 'bg-[#78350F]/40 ring-[#FBBF24]/30 text-[#FCD34D]',
  danger: 'bg-[#7F1D1D]/40 ring-[#F87171]/30 text-[#FCA5A5]',
  neutral: 'bg-white/5 ring-white/10 text-navy-100'
};
const toneIcon = { success: ActivityIcon, info: CoffeeIcon, warning: MoonIcon, danger: AlertTriangleIcon, neutral: PauseIcon };

export function AgentMain() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const a = state.agent;
  const se = state.session;
  const status = deriveAgentStatus(state);
  const Icon = status.key === 'offline' ? CloudOffIcon : status.key === 'syncing' ? Loader2Icon : toneIcon[status.tone];
  const sessionActive = se.state === 'clocked_in' || se.state === 'on_break';
  const toReview = state.intervals.filter((i) => i.memberId === actorId(state) && i.type === 'idle' && !i.queued && i.endSec !== undefined && i.status === 'unclassified').length;
  const ago = Math.max(0, Math.round((clock - a.lastSyncSec) / 60));

  const action = (icon: React.ElementType, label: string, onClick: () => void, meta?: string) => {
    const I = icon;
    return (
      <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors duration-150 hover:bg-white/5">
        <I className="h-4 w-4 text-navy-300" aria-hidden />
        <span className="flex-1">{label}</span>
        {meta && <span className="rounded-full bg-warning-fill px-1.5 text-[11px] font-semibold text-navy-900">{meta}</span>}
        <ChevronRightIcon className="h-3.5 w-3.5 text-navy-300" aria-hidden />
      </button>);

  };

  return (
    <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-3.5">
        <Avatar name={actorMember(state)?.name ?? 'Employee'} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{actorMember(state)?.name ?? 'Not signed in'}</p>
          <p className="truncate text-[11px] text-navy-300">{state.org.name}</p>
        </div>
        <span className={twMerge('flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', a.connection === 'online' || a.connection === 'syncing' ? 'bg-white/10 text-navy-100' : 'bg-[#78350F]/50 text-[#FCD34D]')}>
          {a.connection === 'online' || a.connection === 'syncing' ? <WifiIcon className="h-3 w-3" aria-hidden /> : <CloudOffIcon className="h-3 w-3" aria-hidden />}
          {a.connection === 'online' ? 'Connected' : a.connection === 'syncing' ? 'Syncing' : a.connection === 'offline' ? 'Offline' : a.connection === 'sync_failed' ? 'Sync failed' : 'Attention'}
        </span>
      </div>

      <div className="px-4">
        <motion.div key={status.key} initial={{ opacity: 0.6, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className={twMerge('rounded-xl p-3.5 ring-1', toneCls[status.tone])} role="status">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Icon className={twMerge('h-4 w-4', status.key === 'syncing' && 'animate-spin')} aria-hidden />
            {status.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-navy-100/90">{status.detail}</p>
          {status.key === 'sync_failed' &&
          <Button size="sm" className="mt-2.5" icon={<RefreshCwIcon className="h-3.5 w-3.5" />} onClick={() => dispatch({ type: 'AGENT_SET_CONNECTION', connection: 'online' })}>Retry synchronisation</Button>
          }
          {status.key === 'session_expired' && <Button size="sm" className="mt-2.5" onClick={() => dispatch({ type: 'AGENT_NAV', screen: 'signin' })}>Sign in again</Button>}
          {status.key === 'error' &&
          <div className="mt-2.5 space-y-2">
              <p className="text-xs text-navy-100/90">Windows denied access to the agent’s data folder. No events are being lost silently — observation is stopped until this is fixed.</p>
              <Button size="sm" onClick={() => dispatch({ type: 'AGENT_SET_CONNECTION', connection: 'online' })}>Try again</Button>
            </div>
          }
        </motion.div>
      </div>

      {a.updateAvailable &&
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs ring-1 ring-white/10">
          <DownloadIcon className="h-3.5 w-3.5 text-[#93C5FD]" aria-hidden />
          <span className="flex-1">Version {brand.agentUpdate} is available.</span>
          <button onClick={() => dispatch({ type: 'AGENT_UPDATE', action: 'dismiss' })} className="text-navy-300 hover:text-white">Later</button>
          <button onClick={() => dispatch({ type: 'AGENT_UPDATE', action: 'install' })} className="font-semibold text-[#93C5FD] hover:underline">Install</button>
        </div>
      }

      <dl className="mx-4 mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 text-xs">
        <div className="bg-navy-900 p-3">
          <dt className="text-navy-300">Work session</dt>
          <dd className="tnum mt-0.5 text-sm font-semibold">{sessionActive && se.clockInSec !== undefined ? fmtClock(clock - se.clockInSec) : '—'}</dd>
          <dd className="text-[11px] text-navy-300">{sessionActive && se.clockInSec !== undefined ? `since ${secToLabel(se.clockInSec)}` : 'Clock in via portal'}</dd>
        </div>
        <div className="bg-navy-900 p-3">
          <dt className="text-navy-300">Last sync</dt>
          <dd className="tnum mt-0.5 text-sm font-semibold">{secToLabel(a.lastSyncSec)}</dd>
          <dd className="text-[11px] text-navy-300">{ago < 1 ? 'just now' : `${fmtDur(ago * 60)} ago`}</dd>
        </div>
        <div className="col-span-2 bg-navy-900 p-3">
          <dt className="text-navy-300">Current task</dt>
          <dd className="mt-0.5 truncate text-[13px] font-medium">{sessionActive ? taskText(state, se.projectId, se.taskId, se.category) : 'No active session'}</dd>
          <dd className="tnum mt-1 text-[11px] text-navy-300">
            {a.queue.length} event{a.queue.length === 1 ? '' : 's'} awaiting sync · idle threshold {trackingPolicy.idleThresholdMin} min (employer setting)
          </dd>
        </div>
      </dl>

      <nav aria-label="Agent actions" className="mx-2 mt-2">
        {action(ExternalLinkIcon, 'Open employee portal', () => {dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'day' } });dispatch({ type: 'TOAST', app: 'employee', message: 'Opened from the desktop agent', tone: 'info' });})}
        {action(ListIcon, 'View today’s timeline', () => dispatch({ type: 'AGENT_NAV', screen: 'timeline' }))}
        {action(MoonIcon, 'Review idle intervals', () => dispatch({ type: 'AGENT_NAV', screen: 'timeline' }), toReview ? String(toReview) : undefined)}
        {action(SettingsIcon, 'Settings', () => dispatch({ type: 'AGENT_SETTINGS_TAB', tab: 'account' }))}
        {se.state === 'clocked_in' && trackingPolicy.pauseAllowed &&
        <button onClick={() => dispatch({ type: 'AGENT_PAUSE', paused: !a.paused })} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] hover:bg-white/5">
            {a.paused ? <PlayIcon className="h-4 w-4 text-navy-300" aria-hidden /> : <PauseIcon className="h-4 w-4 text-navy-300" aria-hidden />}
            <span className="flex-1">{a.paused ? 'Resume observations' : 'Pause observations'}</span>
            <span className="text-[11px] text-navy-300">Allowed by policy</span>
          </button>
        }
      </nav>

      <div className="mx-4 mb-4 mt-auto rounded-xl border border-dashed border-white/20 p-3">
        <p className="text-[11px] font-semibold text-navy-300">Demo controls · not part of the product</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <DemoBtn disabled={se.state !== 'clocked_in' || !!a.idleOpenId || a.paused} onClick={() => dispatch({ type: 'AGENT_IDLE_START' })}>Simulate idle</DemoBtn>
          {a.connection === 'offline' ?
          <DemoBtn onClick={() => dispatch({ type: 'AGENT_SET_CONNECTION', connection: 'online' })}>Reconnect</DemoBtn> :

          <DemoBtn onClick={() => dispatch({ type: 'AGENT_SET_CONNECTION', connection: 'offline' })}>Go offline</DemoBtn>
          }
          <DemoBtn disabled={!a.queue.length || a.connection === 'online'} onClick={() => dispatch({ type: 'AGENT_SYNC_DONE', ok: false })}>Fail next sync</DemoBtn>
        </div>
        {a.lastSyncResult &&
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-navy-300">
            <CheckCircle2Icon className="h-3 w-3" aria-hidden />
            Last sync: {a.lastSyncResult.ok ? `${a.lastSyncResult.sent} sent, ${a.lastSyncResult.duplicates} duplicate skipped (event IDs are idempotent)` : 'failed — events kept locally'}
          </p>
        }
      </div>
    </div>);

}

function DemoBtn({ children, onClick, disabled }: {children: React.ReactNode;onClick: () => void;disabled?: boolean;}) {
  return (
    <button onClick={onClick} disabled={disabled} className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/15 disabled:opacity-30">
      {children}
    </button>);

}