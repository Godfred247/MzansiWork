import React, { createContext, useContext } from 'react';

export type EmployeeLayout = 'wide' | 'medium' | 'narrow';

const Ctx = createContext<EmployeeLayout>('wide');

export function EmployeeLayoutProvider({ width, children }: {width: number;children: React.ReactNode;}) {
  const layout: EmployeeLayout = width >= 980 ? 'wide' : width >= 680 ? 'medium' : 'narrow';
  return <Ctx.Provider value={layout}>{children}</Ctx.Provider>;
}

export function useEmployeeLayout(): EmployeeLayout {
  return useContext(Ctx);
}