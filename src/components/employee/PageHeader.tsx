import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const layout = useEmployeeLayout();
  return (
    <div className={twMerge('flex gap-3', layout === 'narrow' ? 'flex-col' : 'items-end justify-between')}>
      <div className="min-w-0">
        <h1 className={twMerge('font-semibold tracking-tight text-ink', layout === 'narrow' ? 'text-xl' : 'text-2xl')}>{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>);

}