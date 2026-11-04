import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MonitorIcon, SmartphoneIcon, LaptopIcon } from 'lucide-react';
import { useDemo } from '../../contexts/DemoStore';
import type { AppId } from '../../types/org';

const appMeta: Record<AppId, {icon: React.ElementType;label: string;cls: string;}> = {
  employer: { icon: SmartphoneIcon, label: 'Employer', cls: 'bg-primary-soft text-primary' },
  employee: { icon: LaptopIcon, label: 'Employee', cls: 'bg-teal-soft text-teal-dark' },
  agent: { icon: MonitorIcon, label: 'Agent', cls: 'bg-navy-50 text-navy' }
};

export function EventFeed() {
  const { state } = useDemo();
  return (
    <section aria-label="Shared activity log" className="flex min-h-0 flex-1 flex-col rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
        <h3 className="text-[13px] font-semibold text-ink">Shared state log</h3>
        <span className="text-[11px] text-muted">One source of truth · simulated API</span>
      </div>
      <ol className="scroll-thin min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
        <AnimatePresence initial={false}>
          {state.feed.map((f) => {
            const m = appMeta[f.app];
            return (
              <motion.li
                key={f.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="flex items-start gap-2 rounded-lg px-1.5 py-1.5">
                
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${m.cls}`} title={m.label}>
                  <m.icon className="h-3 w-3" aria-hidden />
                  <span className="sr-only">{m.label}</span>
                </span>
                <span className="min-w-0 flex-1 text-xs leading-snug text-ink">{f.text}</span>
                <span className="tnum shrink-0 text-[11px] text-subtle">{f.time}</span>
              </motion.li>);

          })}
        </AnimatePresence>
      </ol>
    </section>);

}