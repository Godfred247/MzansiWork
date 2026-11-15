import { flows } from '../../data/flows';
import type { StampedAction } from '../../types/actions';
import type { DemoState } from '../../types/demo';
import { orgReducer } from './orgReducer';
import { timeReducer } from './timeReducer';
import { uiReducer } from './uiReducer';

function routeName(a: StampedAction): string | undefined {
  if (a.type === 'EMPLOYER_PUSH') return a.route.name;
  if (a.type === 'EMPLOYEE_NAV') return a.route.name;
  return undefined;
}

function advanceFlow(s: DemoState, a: StampedAction): DemoState {
  if (!s.flow) return s;
  const flow = flows.find((f) => f.id === s.flow?.id);
  const step = flow?.steps[s.flow.step];
  if (!step?.advanceOn || step.advanceOn.type !== a.type) return s;
  if (step.advanceOn.route && step.advanceOn.route !== routeName(a)) return s;
  return { ...s, flow: { ...s.flow, step: s.flow.step + 1 } };
}

export function demoReducer(s: DemoState, a: StampedAction): DemoState {
  if (a.type === 'REPLACE_STATE') return { ...a.state, employeeWorkOptions: s.employeeWorkOptions };
  const next = uiReducer(s, a) ?? timeReducer(s, a) ?? orgReducer(s, a) ?? s;
  return advanceFlow(next, a);
}