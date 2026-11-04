import { MoonIcon } from 'lucide-react';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { trackingPolicy } from '../../data/policy';
import { fmtDur, secToLabel } from '../../utils/time';

export function AgentIdle() {
  const { state, dispatch, advanceClock } = useDemo();
  const clock = useClock();
  const iv = state.intervals.find((i) => i.id === state.agent.idleOpenId);
  const offline = state.agent.connection !== 'online';
  if (!iv) return null;

  const back = (min: number) => {
    advanceClock(min * 60);
    dispatch({ type: 'AGENT_IDLE_END' });
  };

  return (
    <div className="flex flex-1 flex-col p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#78350F]/50 text-[#FCD34D]">
        <MoonIcon className="h-5 w-5" aria-hidden />
      </span>
      <h1 className="mt-4 text-lg font-semibold">Idle interval detected</h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-navy-300">
        No keyboard or mouse input since <strong className="text-white">{secToLabel(iv.startSec)}</strong> — the {trackingPolicy.idleThresholdMin}-minute threshold set by your employer was reached.
      </p>
      <div className="mt-4 rounded-xl bg-white/5 p-3.5 text-xs leading-relaxed text-navy-100 ring-1 ring-white/10">
        This is only an observation. It isn’t treated as time not worked, and nothing is deducted automatically. When you’re back, just use your computer — the active time is recorded and you can explain the interval later if you want.
      </div>
      <p className="tnum mt-4 text-sm">
        Idle so far: <strong>{fmtDur(clock - iv.startSec)}</strong>
        {offline && <span className="ml-2 text-xs text-[#FCD34D]">· saved locally (offline)</span>}
      </p>
      <p className="mt-1 text-[11px] text-navy-300">You’ll see this once — no repeated pop-ups.</p>

      <div className="mt-auto rounded-xl border border-dashed border-white/20 p-3">
        <p className="text-[11px] font-semibold text-navy-300">Demo controls · simulate returning to the computer</p>
        <div className="mt-2 flex gap-2">
          <button onClick={() => back(15)} className="flex-1 rounded-md bg-white/10 py-2 text-xs font-medium hover:bg-white/15">After 15 min</button>
          <button onClick={() => back(45)} className="flex-1 rounded-md bg-primary py-2 text-xs font-semibold hover:bg-primary-hover">After 45 min</button>
        </div>
      </div>
    </div>);

}