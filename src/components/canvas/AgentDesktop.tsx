import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUpIcon, MinusIcon, WifiIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { deriveAgentStatus } from '../../utils/agentStatus';
import { secToLabel } from '../../utils/time';
import { Logo } from '../shared/Logo';

export function AgentDesktop({ children, highlight }: {children: React.ReactNode;highlight?: boolean;}) {
  const { state } = useDemo();
  const clock = useClock();
  const [open, setOpen] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const status = deriveAgentStatus(state);

  const close = (kind: 'close' | 'min') => {
    setOpen(false);
    setNotice(
      kind === 'close' ?
      'Window closed. The agent keeps running in the system tray. Tracking still follows your work session — clock out or sign out to stop it.' :
      'Minimised to the system tray.'
    );
  };

  return (
    <div className={twMerge('relative flex h-[560px] shrink-0 flex-col overflow-hidden rounded-xl bg-[#1B3354] shadow-frame transition-shadow duration-200', highlight && 'ring-4 ring-primary/40')}>
      <div className="relative min-h-0 flex-1 p-3">
        <AnimatePresence initial={false}>
          {open ?
          <motion.div
            key="win"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative flex h-full flex-col overflow-hidden rounded-lg bg-navy-900 shadow-pop ring-1 ring-white/10">
            
              <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/5 pl-3 text-xs text-navy-100">
                <span className="flex items-center gap-2">
                  <Logo tone="dark" size="sm" showName={false} className="scale-75" />
                  MzansiWork Agent
                </span>
                <span className="flex">
                  <button onClick={() => close('min')} aria-label="Minimise to tray" className="flex h-8 w-10 items-center justify-center hover:bg-white/10">
                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => close('close')} aria-label="Close window (agent keeps running in tray)" className="flex h-8 w-10 items-center justify-center hover:bg-danger">
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
              <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
            </motion.div> :

          <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col items-end justify-end gap-2">
              {notice && <p className="max-w-[300px] rounded-lg bg-navy-900 px-3 py-2.5 text-xs leading-relaxed text-navy-100 shadow-pop ring-1 ring-white/10">{notice}</p>}
              <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-xs font-medium text-white shadow-pop ring-1 ring-white/10 hover:bg-navy-800">
                <span className={twMerge('h-2 w-2 rounded-full', status.dot)} aria-hidden />
                {status.label} · Open agent
              </button>
            </motion.div>
          }
        </AnimatePresence>
      </div>
      <div className="flex h-10 shrink-0 items-center justify-end gap-3 bg-[#0B1424]/90 px-3 text-[11px] text-navy-100">
        <ChevronUpIcon className="h-3.5 w-3.5" aria-hidden />
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-white/10" aria-label={`System tray: MzansiWork — ${status.label}`} title={`MzansiWork — ${status.label}`}>
          <span className="relative">
            <Logo tone="dark" size="sm" showName={false} className="scale-[0.7]" />
            <span className={twMerge('absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-[#0B1424]', status.dot)} aria-hidden />
          </span>
          <span className="max-w-[140px] truncate">{status.label}</span>
        </button>
        <WifiIcon className={twMerge('h-3.5 w-3.5', state.agent.connection === 'offline' && 'opacity-30')} aria-hidden />
        <span className="tnum leading-tight">
          {secToLabel(clock)}
          <br />
          2026/10/26
        </span>
      </div>
    </div>);

}