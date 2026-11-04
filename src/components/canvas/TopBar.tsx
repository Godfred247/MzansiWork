import React from 'react';
import { BookOpenIcon, ClockIcon, FlaskConicalIcon, PlayIcon, RotateCcwIcon, UserCogIcon, LayoutGridIcon } from 'lucide-react';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { flows } from '../../data/flows';
import type { ViewerRole } from '../../types/org';
import { fmtClock, fmtDate, johannesburgNow } from '../../utils/time';
import { viewerRoleLabel } from '../../utils/permissions';
import { isLiveOrg } from '../../utils/workspace';
import { Logo } from '../shared/Logo';
import { Menu } from './Menu';

const roles: {id: ViewerRole;hint: string;}[] = [
{ id: 'owner', hint: 'Lerato Mokoena · full access incl. billing' },
{ id: 'manager', hint: 'Pieter van Wyk · no billing permission' },
{ id: 'approver', hint: 'Nomsa Khumalo · Design team approvals only' }];


function MenuItem({ title, hint, onClick, active }: {title: string;hint?: string;onClick: () => void;active?: boolean;}) {
  return (
    <button role="menuitem" onClick={onClick} className={`block w-full rounded-lg px-3 py-2 text-left transition-colors duration-150 hover:bg-hover ${active ? 'bg-primary-soft' : ''}`}>
      <span className="block text-[13px] font-medium text-ink">{title}</span>
      {hint && <span className="mt-0.5 block text-xs leading-snug text-muted">{hint}</span>}
    </button>);

}

function MenuHeading({ children }: {children: React.ReactNode;}) {
  return <p className="px-3 pb-1 pt-2 text-[11px] font-semibold text-muted">{children}</p>;
}

export function TopBar() {
  const { state, dispatch, startFlow, reset, advanceClock } = useDemo();
  const clock = useClock();
  const pendingInvite = state.invitations.find((i) => i.status === 'pending');
  const live = isLiveOrg(state.orgId) && !state.flow;
  const clockLabel = live ? `${fmtDate(johannesburgNow().iso, 'EEE d MMM')} · ${fmtClock(clock)}` : `Mon 26 Oct · ${fmtClock(clock)}`;

  return (
    <header className="relative z-[70] flex h-14 shrink-0 items-center gap-3 bg-navy px-4 text-white">
      <Logo tone="dark" size="sm" />
      <span className="hidden text-[13px] text-navy-300 xl:inline">Connected prototype</span>
      <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] font-medium text-navy-100">Demo data · actions simulated</span>

      <div className="ml-2 flex items-center gap-1 rounded-lg bg-white/5 py-1 pl-2.5 pr-1 ring-1 ring-white/10">
        <ClockIcon className="h-3.5 w-3.5 text-navy-300" aria-hidden />
        <span className="tnum text-[13px] font-medium" aria-label="Demo clock">
          {clockLabel}
        </span>
        <button onClick={() => advanceClock(15 * 60)} className="ml-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-navy-100 hover:bg-white/10" aria-label="Advance demo clock 15 minutes">
          +15m
        </button>
        <button onClick={() => advanceClock(3600)} className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-navy-100 hover:bg-white/10" aria-label="Advance demo clock 1 hour">
          +1h
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Menu ariaLabel="Start a demo flow" active label={<><PlayIcon className="h-3.5 w-3.5" aria-hidden />{state.flow ? `Flow ${state.flow.id}` : 'Flows'}</>} align="right" width="w-96">
          {(close) =>
          <>
              <MenuHeading>End-to-end flows · each starts from a clean demo state</MenuHeading>
              {flows.map((f) =>
            <MenuItem key={f.id} active={state.flow?.id === f.id} title={`${f.id} · ${f.title}`} hint={f.summary} onClick={() => {startFlow(f.id);close();}} />
            )}
            </>
          }
        </Menu>

        <Menu ariaLabel="Employer role" label={<><UserCogIcon className="h-3.5 w-3.5" aria-hidden />{viewerRoleLabel(state.viewerRole)}</>} align="right" width="w-72">
          {(close) =>
          <>
              <MenuHeading>View employer app as</MenuHeading>
              {roles.map((r) =>
            <MenuItem key={r.id} active={state.viewerRole === r.id} title={viewerRoleLabel(r.id)} hint={r.hint} onClick={() => {dispatch({ type: 'SET_ROLE', role: r.id });close();}} />
            )}
            </>
          }
        </Menu>

        <Menu ariaLabel="Simulate edge states" label={<><FlaskConicalIcon className="h-3.5 w-3.5" aria-hidden />Simulate</>} align="right" width="w-80">
          {(close) => {
            const run = (fn: () => void) => () => {fn();close();};
            return (
              <>
                <MenuHeading>Employee browser</MenuHeading>
                <MenuItem title="Network lost" hint="Banner + safe retry" onClick={run(() => dispatch({ type: 'EMPLOYEE_ISSUE', issue: 'offline' }))} />
                <MenuItem title="Session expired" hint="Sign-in required, no data lost" onClick={run(() => dispatch({ type: 'EMPLOYEE_ISSUE', issue: 'session_expired' }))} />
                <MenuItem title="Clocked in on another device" hint="Duplicate clock-in prevented" onClick={run(() => dispatch({ type: 'EMPLOYEE_ISSUE', issue: 'duplicate_device' }))} />
                {state.employeeIssue && <MenuItem title="Clear browser issue" onClick={run(() => dispatch({ type: 'EMPLOYEE_ISSUE', issue: null }))} />}
                <MenuHeading>Desktop agent</MenuHeading>
                <MenuItem title="Update available" onClick={run(() => dispatch({ type: 'AGENT_UPDATE', action: 'make_available' }))} />
                <MenuItem title="Session expired" onClick={run(() => dispatch({ type: 'AGENT_SET_CONNECTION', connection: 'session_expired' }))} />
                <MenuItem title="Local storage error" onClick={run(() => dispatch({ type: 'AGENT_SET_CONNECTION', connection: 'storage_error' }))} />
                <MenuItem title="First launch" hint="Restart the agent welcome flow" onClick={run(() => {dispatch({ type: 'AGENT_SIGN_OUT' });dispatch({ type: 'AGENT_NAV', screen: 'welcome' });})} />
                <MenuHeading>Employer</MenuHeading>
                <MenuItem title="Renewal payment fails" onClick={run(() => dispatch({ type: 'PAYMENT_FAIL' }))} />
                {pendingInvite && <MenuItem title="Expire a pending invitation" hint={pendingInvite.email} onClick={run(() => dispatch({ type: 'EXPIRE_INVITE', id: pendingInvite.id }))} />}
              </>);

          }}
        </Menu>

        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: state.view === 'docs' ? 'canvas' : 'docs' })}
          className="flex h-8 items-center gap-1.5 rounded-md bg-white/10 px-2.5 text-[13px] font-medium hover:bg-white/15">
          
          {state.view === 'docs' ? <LayoutGridIcon className="h-3.5 w-3.5" aria-hidden /> : <BookOpenIcon className="h-3.5 w-3.5" aria-hidden />}
          {state.view === 'docs' ? 'Live canvas' : 'Docs'}
        </button>
        <button onClick={reset} className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-navy-100 hover:bg-white/10" aria-label="Reset demo data">
          <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden />
          Reset
        </button>
      </div>
    </header>);

}