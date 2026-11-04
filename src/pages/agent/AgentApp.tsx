import React, { useEffect } from 'react';
import { ToastHost } from '../../components/shared/ToastHost';
import { useDemo } from '../../contexts/DemoStore';
import { AgentIdle } from './AgentIdle';
import { AgentMain } from './AgentMain';
import { AgentOnboarding } from './AgentOnboarding';
import { AgentSettings } from './AgentSettings';
import { AgentTimeline } from './AgentTimeline';

export function AgentApp() {
  const { state, dispatch } = useDemo();
  const a = state.agent;

  useEffect(() => {
    if (a.connection !== 'syncing') return;
    const t = window.setTimeout(() => dispatch({ type: 'AGENT_SYNC_DONE', ok: true }), 1400);
    return () => window.clearTimeout(t);
  }, [a.connection, dispatch]);

  let screen: React.ReactNode;
  if (!a.firstRunDone || a.screen === 'welcome') screen = <AgentOnboarding step="welcome" />;else
  if (!a.signedIn || a.screen === 'signin') screen = <AgentOnboarding step="signin" />;else
  if (a.screen === 'idle' && a.idleOpenId) screen = <AgentIdle />;else
  if (a.screen === 'timeline') screen = <AgentTimeline />;else
  if (a.screen === 'settings') screen = <AgentSettings />;else
  screen = <AgentMain />;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col text-white">
      {screen}
      <ToastHost app="agent" position="bottom" />
    </div>);

}