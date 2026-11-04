import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface MenuProps {
  label: React.ReactNode;
  ariaLabel: string;
  children: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
  width?: string;
  active?: boolean;
}

export function Menu({ label, ariaLabel, children, align = 'left', width = 'w-80', active }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className={twMerge(
          'flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150',
          active ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-white/10 text-white hover:bg-white/15'
        )}>
        
        {label}
        <ChevronDownIcon className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className={twMerge(
            'absolute top-10 z-[80] max-h-[75vh] overflow-y-auto rounded-xl border border-line bg-surface p-1.5 text-ink shadow-pop scroll-thin',
            width,
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          )}>
          
            {children(() => setOpen(false))}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}