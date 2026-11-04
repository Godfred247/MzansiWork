import { twMerge } from 'tailwind-merge';

export function Skeleton({ className }: {className?: string;}) {
  return <div aria-hidden className={twMerge('animate-pulse rounded-md bg-line/80', className)} />;
}