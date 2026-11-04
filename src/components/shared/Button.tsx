import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark' | 'success' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface text-ink border border-line hover:bg-hover',
  ghost: 'text-ink hover:bg-hover',
  danger: 'bg-danger text-white hover:bg-danger-dark',
  dark: 'bg-navy text-white hover:bg-navy-700',
  success: 'bg-success text-white hover:bg-[#126B33]',
  subtle: 'bg-primary-soft text-primary hover:bg-[#E0EAFF]'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-5 text-[15px] rounded-xl'
};

export function Button({ variant = 'primary', size = 'md', loading, icon, full, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={twMerge(
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        full && 'w-full',
        className
      )}>
      
      {loading ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>);

}