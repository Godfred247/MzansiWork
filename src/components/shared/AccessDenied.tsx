import React from 'react';
import { ShieldAlertIcon } from 'lucide-react';

interface AccessDeniedProps {
  title: string;
  body: string;
  attempted?: string;
  role: string;
  actions?: React.ReactNode;
}

export function AccessDenied({ title, body, attempted, role, actions }: AccessDeniedProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-10 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <ShieldAlertIcon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      <dl className="mt-5 w-full divide-y divide-line rounded-xl border border-line bg-surface text-left text-[13px]">
        {attempted &&
        <div className="flex justify-between gap-3 px-4 py-2.5">
            <dt className="text-muted">Requested</dt>
            <dd className="truncate font-mono text-xs text-ink">{attempted}</dd>
          </div>
        }
        <div className="flex justify-between gap-3 px-4 py-2.5">
          <dt className="text-muted">Your access</dt>
          <dd className="font-medium text-ink">{role}</dd>
        </div>
        <div className="flex justify-between gap-3 px-4 py-2.5">
          <dt className="text-muted">Response</dt>
          <dd className="font-mono text-xs text-ink">403 Forbidden (server)</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted">Access is checked by the server for every request — not just hidden in the menu.</p>
      {actions && <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>);

}