import { THANDI_ID, starterScenarioIds } from '../../data/members';
import type { DemoState } from '../../types/demo';
import type { FlowId } from '../../types/nav';
import { TODAY } from '../time';
import { createDemoState, DEFAULT_CLOCK } from './initialState';

const h = (hh: number, mm = 0) => hh * 3600 + mm * 60;

function clearThandiToday(s: DemoState): DemoState {
  return {
    ...s,
    intervals: s.intervals.filter((i) => !(i.memberId === THANDI_ID && i.date === TODAY)),
    events: s.events.filter((e) => e.date !== TODAY),
    session: { state: 'clocked_out', category: 'Client work', submitted: false }
  };
}

export function setupFlow(id: FlowId): {state: DemoState;clock: number;} {
  let s = createDemoState();
  let clock = DEFAULT_CLOCK;
  switch (id) {
    case 'A':
      s = { ...s, employerAuthed: false, employerStack: [{ name: 'welcome' }] };
      clock = h(8, 30);
      break;
    case 'B':
      s = { ...s, employerStack: [{ name: 'employees' }, { name: 'invite' }], employeeAuthed: false, employeeRoute: { name: 'invite' } };
      break;
    case 'C':
      s = {
        ...s,
        subscription: { ...s.subscription, planId: 'starter', frequency: 'monthly' },
        members: s.members.filter((m) => starterScenarioIds.includes(m.id)),
        invitations: s.invitations.filter((i) => i.id === 'inv-kea' || i.id === 'inv-jsmith'),
        employerStack: [{ name: 'employees' }, { name: 'invite' }]
      };
      break;
    case 'D':
      s = { ...clearThandiToday(s), employeeRoute: { name: 'day' }, daySubmissions: { ...s.daySubmissions, [TODAY]: 'open' } };
      clock = h(7, 58);
      break;
    case 'E':
      s = { ...s, employeeRoute: { name: 'activity' }, employerStack: [{ name: 'dashboard' }] };
      clock = h(10, 5);
      break;
    case 'F':
      s = { ...s, employeeRoute: { name: 'leave' }, employerStack: [{ name: 'approvals', params: { tab: 'leave' } }] };
      break;
    case 'G':
      s = { ...s, employerStack: [{ name: 'more' }, { name: 'reports' }] };
      break;
    case 'H':
      s = { ...s, employerStack: [{ name: 'more' }, { name: 'subscription' }] };
      break;
    case 'I':
      s = { ...s, agent: { ...s.agent, screen: 'main' } };
      clock = h(11, 0);
      break;
    case 'J':
      s = { ...s, employeeRoute: { name: 'denied', params: { path: '/employer/billing' } }, employerStack: [{ name: 'more' }] };
      break;
  }
  return { state: { ...s, flow: { id, step: 0 } }, clock };
}