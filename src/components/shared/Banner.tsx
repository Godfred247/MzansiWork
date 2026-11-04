import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type BannerTone = 'info' | 'warning' | 'danger' | 'success' | 'neutral';

interface BannerProps {
  tone?: BannerTone;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ElementType;
}

const styles: Record<BannerTone, string> = {
  info: 'bg-info-soft border-info-line text-info',
  warning: 'bg-warning-soft border-warning-line text-warning',
  danger: 'bg-danger-soft border-danger-line text-danger-dark',
  success: 'bg-success-soft border-success-line text-success',
  neutral: 'bg-hover border-line text-muted'
};

const icons: Record<BannerTone, React.ElementType> = {
  info: InfoIcon,
  warning: AlertTriangleIcon,
  danger: XCircleIcon,
  success: CheckCircle2Icon,
  neutral: InfoIcon
};

export function Banner({ tone = 'info', title, children, action, className, icon }: BannerProps) {
  const Icon = icon ?? icons[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={twMerge('flex items-start gap-3 rounded-xl border px-3.5 py-3', styles[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold">{title}</p>
        {children && <div className="mt-0.5 text-[13px] leading-relaxed text-ink/80">{children}</div>}
        {action && <div className="mt-2.5 flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>);

}