import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { useDemo } from '../../contexts/DemoStore';
import { flows } from '../../data/flows';

const appLabel = { employer: 'Employer mobile', employee: 'Employee browser', agent: 'Windows agent', canvas: 'Demo controls' };

export function FlowGuide() {
  const { state, dispatch, startFlow } = useDemo();
  const flow = state.flow ? flows.find((f) => f.id === state.flow?.id) : undefined;
  const stepIdx = state.flow?.step ?? 0;
  const done = flow ? stepIdx >= flow.steps.length : false;
  const step = flow?.steps[stepIdx];

  return (
    <AnimatePresence>
      {flow &&
      <motion.aside
        aria-label={`Flow ${flow.id} guide`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-auto absolute bottom-4 left-1/2 z-[75] w-[480px] max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl bg-navy p-4 text-white shadow-pop">
        
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold">Flow {flow.id}</span>
            <h3 className="truncate text-[13px] font-semibold">{flow.title}</h3>
            <span className="tnum ml-auto text-[11px] text-navy-300">
              {done ? 'Complete' : `Step ${stepIdx + 1} of ${flow.steps.length}`}
            </span>
            <button onClick={() => dispatch({ type: 'END_FLOW' })} aria-label="Close flow guide" className="rounded p-1 text-navy-300 hover:bg-white/10 hover:text-white">
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 flex gap-1" aria-hidden>
            {flow.steps.map((_, i) =>
          <span key={i} className={`h-1 flex-1 rounded-full ${i < stepIdx ? 'bg-teal' : i === stepIdx ? 'bg-white' : 'bg-white/15'}`} />
          )}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={stepIdx} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.15 }} className="mt-3 min-h-[44px]">
              {done ?
            <p className="flex items-start gap-2 text-sm leading-snug">
                  <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#4ADE80]" aria-hidden />
                  Flow complete. Every state change above went through the same shared record and audit log.
                </p> :

            <>
                  <p className="text-[11px] font-semibold text-[#93C5FD]">{step ? appLabel[step.app] : ''}</p>
                  <p className="mt-0.5 text-sm leading-snug">{step?.text}</p>
                </>
            }
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 flex items-center justify-between">
            <button
            onClick={() => dispatch({ type: 'FLOW_STEP', delta: -1 })}
            disabled={stepIdx === 0}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-navy-100 hover:bg-white/10 disabled:opacity-30">
            
              <ChevronLeftIcon className="h-3.5 w-3.5" aria-hidden /> Back
            </button>
            {done ?
          <button onClick={() => startFlow(flow.id)} className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-navy hover:bg-navy-50">
                Run again
              </button> :

          <button onClick={() => dispatch({ type: 'FLOW_STEP', delta: 1 })} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-navy-100 hover:bg-white/10">
                Skip step <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden />
              </button>
          }
          </div>
        </motion.aside>
      }
    </AnimatePresence>);

}