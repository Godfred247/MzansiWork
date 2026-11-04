import { createContext, useContext, type ReactNode } from 'react';

const Ctx = createContext(false);

export function PresentationalProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={true}>{children}</Ctx.Provider>;
}

export function usePresentational() {
  return useContext(Ctx);
}
