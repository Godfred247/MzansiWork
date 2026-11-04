import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const ease = [0.23, 1, 0.32, 1] as const;

/** Bottom sheet scoped to its nearest positioned frame (used inside the phone frame). */
export function Sheet({ open, onClose, title, description, children, footer }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <motion.div
          className="absolute inset-0 bg-ink/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease }}
          onClick={onClose} />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="relative flex max-h-[88%] flex-col rounded-t-2xl bg-surface shadow-pop"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.26, ease }}>
          
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" aria-hidden />
            <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-3">
              <div>
                <h2 className="text-base font-semibold text-ink">{title}</h2>
                {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
              </div>
              <button onClick={onClose} aria-label="Close" className="-mr-1 rounded-md p-1.5 text-muted hover:bg-hover">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="scroll-thin flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}