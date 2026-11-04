import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark';
}

const ease = [0.23, 1, 0.32, 1] as const;
const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

/** Modal scoped to its nearest positioned frame so each app's dialogs stay inside its device. */
export function Dialog({ open, onClose, title, description, children, footer, size = 'md', tone = 'light' }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
          className="absolute inset-0 bg-ink/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease }}
          onClick={onClose} />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={twMerge(
            'relative flex max-h-full w-full flex-col overflow-hidden rounded-2xl shadow-pop',
            widths[size],
            tone === 'light' ? 'bg-surface' : 'bg-navy-800 text-white ring-1 ring-white/10'
          )}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease }}>
          
            <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-5">
              <div>
                <h2 className={twMerge('text-base font-semibold', tone === 'light' ? 'text-ink' : 'text-white')}>{title}</h2>
                {description && <p className={twMerge('mt-1 text-[13px]', tone === 'light' ? 'text-muted' : 'text-navy-300')}>{description}</p>}
              </div>
              <button onClick={onClose} aria-label="Close dialog" className={twMerge('-mr-1 rounded-md p-1.5', tone === 'light' ? 'text-muted hover:bg-hover' : 'text-navy-300 hover:bg-white/10')}>
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            {children && <div className="scroll-thin overflow-y-auto px-5 py-2">{children}</div>}
            {footer && <div className={twMerge('flex justify-end gap-2 px-5 pb-5 pt-3')}>{footer}</div>}
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}