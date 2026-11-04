import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDemo } from '../../contexts/DemoStore';
import type { Toast } from '../../types/demo';
import type { AppId } from '../../types/org';

const icons = { success: CheckCircle2Icon, warning: AlertTriangleIcon, danger: XCircleIcon, info: InfoIcon, neutral: InfoIcon, primary: InfoIcon };
const iconColor = { success: 'text-[#4ADE80]', warning: 'text-[#FBBF24]', danger: 'text-[#F87171]', info: 'text-[#7DD3FC]', neutral: 'text-navy-100', primary: 'text-[#93C5FD]' };

function ToastItem({ toast, onDone }: {toast: Toast;onDone: () => void;}) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 4200);
    return () => window.clearTimeout(t);
  }, [onDone]);
  const Icon = icons[toast.tone];
  return (
    <motion.div
      layout
      role="status"
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="pointer-events-auto flex w-full items-start gap-2.5 rounded-xl bg-navy px-3.5 py-2.5 text-[13px] text-white shadow-pop">
      
      <Icon className={twMerge('mt-0.5 h-4 w-4 shrink-0', iconColor[toast.tone])} aria-hidden />
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button onClick={onDone} aria-label="Dismiss notification" className="-mr-1 rounded p-0.5 text-navy-300 hover:text-white">
        <XIcon className="h-3.5 w-3.5" />
      </button>
    </motion.div>);

}

export function ToastHost({ app, position = 'top' }: {app: AppId;position?: 'top' | 'bottom';}) {
  const { state, dispatch } = useDemo();
  const toasts = state.toasts.filter((t) => t.app === app).slice(-2);
  return (
    <div
      aria-live="polite"
      className={twMerge('pointer-events-none absolute inset-x-0 z-[60] flex flex-col items-center gap-2 px-3', position === 'top' ? 'top-3' : 'bottom-20')}>
      
      <div className="flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) =>
          <ToastItem key={t.id} toast={t} onDone={() => dispatch({ type: 'DISMISS_TOAST', id: t.id })} />
          )}
        </AnimatePresence>
      </div>
    </div>);

}