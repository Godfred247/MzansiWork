import React from 'react';
import { AlertCircleIcon } from 'lucide-react';

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, optional, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center justify-between text-[13px] font-medium text-ink">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error ?
      <p id={`${htmlFor}-error`} role="alert" className="flex items-start gap-1 text-xs text-danger-dark">
          <AlertCircleIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p> :
      hint ?
      <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p> :
      null}
    </div>);

}