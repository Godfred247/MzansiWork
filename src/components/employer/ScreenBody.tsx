import React from 'react';
import { twMerge } from 'tailwind-merge';

export function ScreenBody({ children, className }: {children: React.ReactNode;className?: string;}) {
  return <div className={twMerge('scroll-thin min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-8 pt-4', className)}>{children}</div>;
}