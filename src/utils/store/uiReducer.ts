import type { StampedAction } from '../../types/actions';
import type { DemoState } from '../../types/demo';
import { secToLabel } from '../time';
import { viewerRoleLabel } from '../permissions';
import { applyWorkspace } from '../workspace';
import { addAudit, addFeed, addToast } from './helpers';

export function uiReducer(s: DemoState, a: StampedAction): DemoState | null {
  const now = a.now;
  switch (a.type) {
    case 'EMPLOYER_PUSH':
      return { ...s, employerStack: [...s.employerStack, a.route] };
    case 'EMPLOYER_BACK':
      return s.employerStack.length > 1 ? { ...s, employerStack: s.employerStack.slice(0, -1) } : s;
    case 'EMPLOYER_TAB':
      return { ...s, employerStack: [{ name: a.tab }] };
    case 'EMPLOYER_SIGN_IN':
      return { ...s, employerAuthed: true, employerStack: [{ name: 'dashboard' }] };
    case 'EMPLOYER_SIGN_OUT':
      return { ...s, employerAuthed: false, employerStack: [{ name: 'welcome' }] };
    case 'ENTER_WORKSPACE':
      return applyWorkspace(s, a.workspace, a.app, now);
    case 'ONBOARD_COMPLETE':{
        let n: DemoState = { ...s, employerAuthed: true, employerStack: [{ name: 'dashboard' }], org: { ...s.org, name: a.orgName } };
        n = addAudit(n, { actor: a.ownerName, action: 'Created organisation', target: a.orgName, category: 'subscription' }, now);
        return addFeed(n, 'employer', `Onboarding complete for “${a.orgName}”`, now);
      }
    case 'EMPLOYEE_NAV':
      return { ...s, employeeRoute: a.route };
    case 'EMPLOYEE_SIGN_IN':
      return { ...s, employeeAuthed: true, employeeIssue: null, employeeRoute: { name: 'day' } };
    case 'EMPLOYEE_SIGN_OUT':
      return { ...s, employeeAuthed: false, employeeRoute: { name: 'signin' } };
    case 'EMPLOYEE_ISSUE':
      return { ...s, employeeIssue: a.issue };
    case 'EMPLOYEE_VIEWPORT':
      return { ...s, employeeViewport: a.viewport };
    case 'SET_ROLE':{
        const n: DemoState = { ...s, viewerRole: a.role, employerStack: s.employerAuthed ? s.employerStack : s.employerStack };
        return addFeed(n, 'employer', `Employer app now viewed as ${viewerRoleLabel(a.role)}`, now);
      }
    case 'AGENT_NAV':
      return { ...s, agent: { ...s.agent, screen: a.screen } };
    case 'AGENT_SETTINGS_TAB':
      return { ...s, agent: { ...s.agent, settingsTab: a.tab, screen: 'settings' } };
    case 'AGENT_FIRST_RUN_DONE':
      return { ...s, agent: { ...s.agent, firstRunDone: true, screen: 'signin' } };
    case 'AGENT_SIGN_IN':{
        const n: DemoState = { ...s, agent: { ...s.agent, signedIn: true, screen: 'main', connection: s.agent.queue.length ? 'syncing' : 'online' } };
        return addToast(addFeed(n, 'agent', 'Agent signed in via browser handoff', now), 'agent', 'Signed in as Thandi Nkosi', 'success');
      }
    case 'AGENT_SIGN_OUT':{
        const n: DemoState = { ...s, agent: { ...s.agent, signedIn: false, screen: 'signin', idleOpenId: undefined } };
        return addFeed(n, 'agent', 'Agent signed out — no observations are recorded while signed out', now);
      }
    case 'AGENT_SET_CONNECTION':{
        const c = a.connection === 'online' && s.agent.queue.length ? 'syncing' : a.connection;
        let n: DemoState = { ...s, agent: { ...s.agent, connection: c } };
        if (a.connection === 'offline') {
          n = addFeed(n, 'agent', 'Agent lost connection — supported events will queue locally', now);
          n = addToast(n, 'agent', 'Offline — events are saved on this computer until reconnected', 'warning');
        }
        if (a.connection === 'session_expired') n = addFeed(n, 'agent', 'Agent session expired — sign-in required', now);
        return n;
      }
    case 'AGENT_TOGGLE_NOTIFICATIONS':
      return { ...s, agent: { ...s.agent, notifications: !s.agent.notifications } };
    case 'AGENT_PAUSE':{
        let n: DemoState = { ...s, agent: { ...s.agent, paused: a.paused } };
        n = addAudit(n, { actor: 'Thandi Nkosi', action: a.paused ? 'Paused agent observations' : 'Resumed agent observations', target: 'Desktop agent', reason: 'Permitted by tracking policy', category: 'attendance' }, now);
        n = addFeed(n, 'agent', a.paused ? 'Thandi paused idle observations — status shows “Observations paused” everywhere' : 'Thandi resumed idle observations', now);
        return addToast(n, 'agent', a.paused ? 'Observations paused. Your work session continues.' : 'Observations resumed', 'info');
      }
    case 'AGENT_UPDATE':{
        if (a.action === 'make_available') return { ...s, agent: { ...s.agent, updateAvailable: true } };
        if (a.action === 'dismiss') return { ...s, agent: { ...s.agent, updateAvailable: false } };
        return addToast({ ...s, agent: { ...s.agent, updateAvailable: false } }, 'agent', 'Update installed (simulated). Restart not required.', 'success');
      }
    case 'TOAST':
      return addToast(s, a.app, a.message, a.tone);
    case 'DISMISS_TOAST':
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case 'MARK_READ':
      return { ...s, notifications: s.notifications.map((n) => n.app === a.app ? { ...n, read: true } : n) };
    case 'FLOW_STEP':
      return s.flow ? { ...s, flow: { ...s.flow, step: Math.max(0, s.flow.step + a.delta) } } : s;
    case 'END_FLOW':
      return { ...s, flow: null };
    case 'SET_FOCUS':
      return { ...s, focus: a.app };
    case 'SET_VIEW':
      return { ...s, view: a.view, docsSection: a.section ?? s.docsSection };
  }
  void secToLabel;
  return null;
}