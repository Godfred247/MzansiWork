import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { breakCategories } from '../../data/projects';
import { Button } from '../shared/Button';
import { Dialog } from '../shared/Dialog';

export function BreakDialog({ open, onClose, onStart }: {open: boolean;onClose: () => void;onStart: (category: string) => void;}) {
  const [choice, setChoice] = useState('Tea break');
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Take a break"
      description="Choose the type of break. How breaks count toward paid time is set by your company policy."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onStart(choice)}>Start {choice.toLowerCase()}</Button>
        </>
      }>
      
      <fieldset>
        <legend className="sr-only">Break type</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {breakCategories.map((b) =>
          <label
            key={b.id}
            className={twMerge(
              'flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition-colors duration-150',
              choice === b.id ? 'border-primary bg-primary-soft' : 'border-line hover:bg-hover'
            )}>
            
              <span className="flex items-center gap-2.5">
                <input type="radio" name="break-type" value={b.id} checked={choice === b.id} onChange={() => setChoice(b.id)} className="h-4 w-4 accent-primary" />
                <span>
                  <span className="block text-sm font-medium text-ink">{b.id}</span>
                  <span className="block text-xs text-muted">Usually {b.expectedMin} min</span>
                </span>
              </span>
              <span className="text-[11px] font-medium text-muted">{b.paid ? 'Paid' : 'Unpaid'} per policy</span>
            </label>
          )}
        </div>
      </fieldset>
    </Dialog>);

}