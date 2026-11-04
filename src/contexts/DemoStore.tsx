import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { DemoAction, StampedAction } from '../types/actions';
import type { DemoState } from '../types/demo';
import type { FlowId } from '../types/nav';
import { demoReducer } from '../utils/store/demoReducer';
import { setupFlow } from '../utils/store/flowSetup';
import { createInitialState, DEFAULT_CLOCK } from '../utils/store/initialState';
import { johannesburgNow } from '../utils/time';
import { isLiveOrg } from '../utils/workspace';

interface StoreValue {
  state: DemoState;
  dispatch: (a: DemoAction) => void;
  startFlow: (id: FlowId) => void;
  reset: () => void;
  advanceClock: (sec: number) => void;
}

const StoreCtx = createContext<StoreValue | null>(null);
const ClockCtx = createContext<number>(DEFAULT_CLOCK);

export function DemoProvider({ children }: {children: React.ReactNode;}) {
  const clockRef = useRef(DEFAULT_CLOCK);
  const offsetRef = useRef(0);
  const liveRef = useRef(false);
  const [clock, setClock] = useState(DEFAULT_CLOCK);
  const [offset, setOffset] = useState(0);
  const [state, raw] = useReducer(demoReducer, undefined, createInitialState);
  const live = isLiveOrg(state.orgId) && !state.flow;
  liveRef.current = live;

  useEffect(() => {
    const t = window.setInterval(() => {
      clockRef.current += 1;
      setClock(clockRef.current);
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  const dispatch = useCallback((a: DemoAction) => {
    const now = liveRef.current ? johannesburgNow().sec + offsetRef.current : clockRef.current;
    raw({ ...a, now } as StampedAction);
  }, []);

  const advanceClock = useCallback((sec: number) => {
    if (liveRef.current) {
      offsetRef.current += sec;
      setOffset(offsetRef.current);
      return;
    }
    clockRef.current += sec;
    setClock(clockRef.current);
  }, []);

  const startFlow = useCallback((id: FlowId) => {
    const { state: s, clock: c } = setupFlow(id);
    clockRef.current = c;
    offsetRef.current = 0;
    setOffset(0);
    setClock(c);
    raw({ type: 'REPLACE_STATE', state: s, now: c });
  }, []);

  const reset = useCallback(() => {
    clockRef.current = DEFAULT_CLOCK;
    offsetRef.current = 0;
    setOffset(0);
    setClock(DEFAULT_CLOCK);
    raw({ type: 'REPLACE_STATE', state: createInitialState(), now: DEFAULT_CLOCK });
  }, []);

  const shown = live ? johannesburgNow().sec + offset : clock;
  const value = useMemo(() => ({ state, dispatch, startFlow, reset, advanceClock }), [state, dispatch, startFlow, reset, advanceClock]);

  return (
    <StoreCtx.Provider value={value}>
      <ClockCtx.Provider value={shown}>{children}</ClockCtx.Provider>
    </StoreCtx.Provider>);

}

export function useDemo(): StoreValue {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('useDemo must be used inside DemoProvider');
  return v;
}

export function useClock(): number {
  return useContext(ClockCtx);
}