import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, CircleDotIcon, CircleIcon, InfoIcon, XCircleIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { Tone } from '../../types/org';

const styles: Record<Tone, string> = {
  success: 'bg-success-soft text-success border-success-line',
  warning: 'bg-warning-soft text-warning border-warning-line',
  danger: 'bg-danger-soft text-danger-dark border-danger-line',
  info: 'bg-info-soft text-info border-info-line',
  neutral: 'bg-hover text-muted border-line',
  primary: 'bg-primary-soft text-primary border-primary-line'
};

const icons: Record<Tone, React.ElementType> = {
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  danger: XCircleIcon,
  info: InfoIcon,
  neutral: CircleIcon,
  primary: CircleDotIcon
};

interface StatusBadgeProps {
  tone: Tone;
  label: string;
  size?: 'sm' | 'md';
  hideIcon?: boolean;
  className?: string;
}

export function StatusBadge({ tone, label, size = 'sm', hideIcon, className }: StatusBadgeProps) {
  const Icon = icons[tone];
  return (
    <span
      className={twMerge(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border font-medium',
        size === 'sm' ? 'h-5 px-2 text-[11px]' : 'h-6 px-2.5 text-xs',
        styles[tone],
        className
      )}>
      
      {!hideIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />}
      {label}
    </span>);

}