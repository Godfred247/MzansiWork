import React, { useState } from 'react';
import { ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../../components/shared/Button';
import { Dialog } from '../../components/shared/Dialog';
import { Toggle } from '../../components/shared/Toggle';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { brand } from '../../data/brand';
import { collected, trackingPolicy } from '../../data/policy';
import type { AgentSettingsTab } from '../../types/agent';
import { deriveAgentStatus } from '../../utils/agentStatus';
import { actorMember } from '../../utils/selectors';
import { secToLabel } from '../../utils/time';

const tabs: {id: AgentSettingsTab;label: string;}[] = [
{ id: 'account', label: 'Account' },
{ id: 'tracking', label: 'Tracking' },
{ id: 'notifications', label: 'Notifications' },
{ id: 'sync', label: 'Sync' },
{ id: 'about', label: 'About' }];


function Row({ k, v }: {k: string;v: React.ReactNode;}) {
  return (
    <div className="flex justify-between gap-3 py-2 text-[13px]">
      <dt className="text-navy-300">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>);

}

export function AgentSettings() {
  const { state, dispatch } = useDemo();
  const me = actorMember(state);
  const clock = useClock();
  const a = state.agent;
  const status = deriveAgentStatus(state);
  const [confirm, setConfirm] = useState<'signout' | 'exit' | null>(null);
  const [checking, setChecking] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <button onClick={() => dispatch({ type: 'AGENT_NAV', screen: 'main' })} aria-label="Back" className="rounded p-1 hover:bg-white/10"><ArrowLeftIcon className="h-4 w-4" /></button>
        <h1 className="text-sm font-semibold">Settings</h1>
      </div>
      <div role="tablist" aria-label="Settings sections" className="scroll-none flex gap-1 overflow-x-auto border-b border-white/5 px-3 py-2">
        {tabs.map((t) =>
        <button key={t.id} role="tab" aria-selected={a.settingsTab === t.id} onClick={() => dispatch({ type: 'AGENT_SETTINGS_TAB', tab: t.id })} className={twMerge('whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium', a.settingsTab === t.id ? 'bg-white text-navy' : 'text-navy-100 hover:bg-white/10')}>
            {t.label}
          </button>
        )}
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {a.settingsTab === 'account' &&
        <>
            <dl className="divide-y divide-white/5"><Row k="Signed in as" v={me?.email ?? 'Not signed in'} /><Row k="Organisation" v={state.org.name || 'No organisation'} /><Row k="Role" v={me?.role ?? 'Employee'} /></dl>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'day' } })}>Open browser portal</Button>
              <Button variant="danger" size="sm" onClick={() => setConfirm('signout')}>Sign out</Button>
            </div>
          </>
        }
        {a.settingsTab === 'tracking' &&
        <div className="space-y-4">
            <dl className="divide-y divide-white/5">
              <Row k="Current state" v={status.label} />
              <Row k="Idle threshold" v={`${trackingPolicy.idleThresholdMin} min · managed by employer`} />
              <Row k="Policy" v={trackingPolicy.version} />
            </dl>
            <div>
              <p className="text-xs font-semibold">What is collected</p>
              <ul className="mt-1.5 space-y-1.5 text-xs text-navy-100">{collected.slice(0, 3).map((c) => <li key={c.item}>• {c.item} — <span className="text-navy-300">{c.when}</span></li>)}</ul>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-navy-100 ring-1 ring-white/10">
              <p className="mb-1.5 font-semibold text-white">What happens when I…</p>
              <p><strong className="text-white">Close the window:</strong> the agent keeps running in the tray; behaviour doesn’t change.</p>
              <p className="mt-1"><strong className="text-white">Pause observations:</strong> idle/active times stop being recorded; your work session continues. Shown as paused everywhere.</p>
              <p className="mt-1"><strong className="text-white">Sign out or exit:</strong> observation stops completely. Your portal session isn’t affected.</p>
            </div>
            <button onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'policy' } })} className="text-xs font-medium text-[#93C5FD] hover:underline">Read the full tracking policy</button>
          </div>
        }
        {a.settingsTab === 'notifications' &&
        <div className="space-y-4">
            <Toggle tone="dark" label="Interval ready / sync success notices" description="Non-essential desktop notifications." checked={a.notifications} onChange={() => dispatch({ type: 'AGENT_TOGGLE_NOTIFICATIONS' })} />
            <Toggle tone="dark" label="Tracking and security notices" description="Always shown: tracking started/stopped, sign-in required, sync failures. These can’t be turned off." checked disabled onChange={() => undefined} />
          </div>
        }
        {a.settingsTab === 'sync' &&
        <>
            <dl className="divide-y divide-white/5">
              <Row k="Connection" v={a.connection === 'online' ? 'Connected' : a.connection.replace('_', ' ')} />
              <Row k="Last successful sync" v={secToLabel(a.lastSyncSec)} />
              <Row k="Events awaiting sync" v={<span className="tnum">{a.queue.length}</span>} />
            </dl>
            <p className="mt-3 text-xs text-navy-300">Each event carries a unique ID, so re-sending never creates duplicate records.</p>
            <Button size="sm" className="mt-3" icon={<RefreshCwIcon className="h-3.5 w-3.5" />} disabled={a.connection === 'offline' || a.connection === 'syncing'} onClick={() => dispatch({ type: 'AGENT_SET_CONNECTION', connection: 'online' })}>
              Retry synchronisation
            </Button>
            {a.connection === 'offline' && <p className="mt-2 text-xs text-[#FCD34D]">You’re offline. Events stay on this computer until you reconnect.</p>}
          </>
        }
        {a.settingsTab === 'about' &&
        <>
            <dl className="divide-y divide-white/5">
              <Row k="Version" v={brand.agentVersion} />
              <Row k="Updates" v={a.updateAvailable ? `${brand.agentUpdate} available` : 'Up to date'} />
              <Row k="Support" v={brand.supportEmail} />
            </dl>
            <div className="mt-4 flex flex-col gap-2">
              {a.updateAvailable ?
            <Button size="sm" onClick={() => dispatch({ type: 'AGENT_UPDATE', action: 'install' })}>Install update</Button> :

            <Button size="sm" variant="secondary" loading={checking} onClick={() => {setChecking(true);window.setTimeout(() => {setChecking(false);dispatch({ type: 'TOAST', app: 'agent', message: 'You have the latest version.', tone: 'success' });}, 900);}}>Check for updates</Button>
            }
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setConfirm('exit')}>Exit agent</Button>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-navy-300">Privacy: only timestamps of idle/active transitions during work sessions. No keystrokes, screenshots, camera or microphone.</p>
          </>
        }
      </div>

      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        tone="dark"
        size="sm"
        title={confirm === 'exit' ? 'Exit the agent?' : 'Sign out of the agent?'}
        description={
        confirm === 'exit' ?
        'Idle/active observation stops until you open the agent again. Your work session in the portal continues.' :
        'Observation stops until you sign in again.'
        }
        footer={
        <>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button size="sm" variant="danger" onClick={() => {dispatch({ type: 'AGENT_SIGN_OUT' });setConfirm(null);}}>{confirm === 'exit' ? 'Exit' : 'Sign out'}</Button>
          </>
        }>
        
        {a.queue.length > 0 && <p className="text-xs text-[#FCD34D]">{a.queue.length} unsynced events will be kept on this computer and sent after you next sign in.</p>}
        <p className="tnum text-[11px] text-navy-300">{secToLabel(clock)}</p>
      </Dialog>
    </div>);

}