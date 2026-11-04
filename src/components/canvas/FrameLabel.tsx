import { Maximize2Icon, Minimize2Icon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDemo } from '../../contexts/DemoStore';
import { flows } from '../../data/flows';
import type { AppId } from '../../types/org';

interface FrameLabelProps {
  app: AppId;
  title: string;
  meta: string;
}

export function FrameLabel({ app, title, meta }: FrameLabelProps) {
  const { state, dispatch } = useDemo();
  const flow = state.flow ? flows.find((f) => f.id === state.flow?.id) : undefined;
  const isNext = flow?.steps[state.flow?.step ?? 0]?.app === app;
  const focused = state.focus === app;
  return (
    <div className="mb-2 flex h-7 items-center gap-2">
      <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
      <span className="truncate text-xs text-muted">{meta}</span>
      {isNext &&
      <motion.span
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
        
          Next step here
        </motion.span>
      }
      <button
        onClick={() => dispatch({ type: 'SET_FOCUS', app: focused ? null : app })}
        className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted hover:bg-white hover:text-ink"
        aria-label={focused ? `Exit focus mode for ${title}` : `Focus ${title} for usability testing`}>
        
        {focused ? <Minimize2Icon className="h-3.5 w-3.5" aria-hidden /> : <Maximize2Icon className="h-3.5 w-3.5" aria-hidden />}
        {focused ? 'Show all' : 'Focus'}
      </button>
    </div>);

}