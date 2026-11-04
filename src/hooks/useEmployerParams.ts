import { useDemo } from '../contexts/DemoStore';

export function useEmployerParams(): Record<string, string> {
  const { state } = useDemo();
  return state.employerStack[state.employerStack.length - 1]?.params ?? {};
}