import React from 'react';
import { twMerge } from 'tailwind-merge';

const tones = {
  primary: 'bg-primary text-white',
  teal: 'bg-teal-dark text-white',
  navy: 'bg-navy text-white',
  warning: 'bg-warning-fill text-white',
  danger: 'bg-danger text-white',
  neutral: 'bg-muted text-white',
  success: 'bg-success text-white'
};

export function RowIcon({ icon: Icon, tone = 'primary' }: {icon: React.ElementType;tone?: keyof typeof tones;}) {
  return (
    <span className={twMerge('flex h-8 w-8 items-center justify-center rounded-lg', tones[tone])}>
      <Icon className="h-4 w-4" aria-hidden />
    </span>);

}