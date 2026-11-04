import { useState } from 'react';
import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { actorId } from '../../utils/selectors';
import { inactivityCategories } from '../../data/projects';
import { intervalLabels } from '../../data/statusLabels';
import type { Interval } from '../../types/time';
import { TODAY, fmtDur, range } from '../../utils/time';

export function AgentTimeline() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const [explaining, setExplaining] = useState<Interval | null>(null);
  const [cat, setCat] = useState(inactivityCategories[0].id);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const today = state.intervals.filter((i) => i.memberId === actorId(state) && i.date === TODAY).sort((a, b) => a.startSec - b.startSec);
  const pendingReview = state.intervals.filter((i) => i.memberId === actorId(state) && i.type === 'idle' && i.date !== TODAY && i.status === 'unclassified');

  const submit = () => {
    if (!explaining) return;
    if (reason.trim().length < 10) return setErr('Add a short explanation (at least 10 characters).');
    dispatch({
      type: 'SUBMIT_CORRECTION',
      payload: {
        kind: 'idle_classification', date: explaining.date, intervalId: explaining.id, original: `Idle ${range(explaining.startSec, explaining.endSec)} (desktop agent observation)`,
        requested: `Classify as work — ${cat}`, classification: cat, reason: reason.trim(), source: 'agent', durationSec: (explaining.endSec ?? 0) - explaining.startSec
      }
    });
    setExplaining(null);
    setReason('');
    setErr('');
  };

  const row = (iv: Interval) => {
    const dur = (iv.endSec ?? clock) - iv.startSec;
    const label = iv.type === 'idle' ? intervalLabels[iv.status].label : iv.type === 'break' ? iv.breakCategory : 'Work';
    return (
      <li key={iv.id} className="flex items-center gap-2.5 py-2">
        <span className={twMerge('h-6 w-1.5 rounded-full', iv.type === 'work' ? 'bg-primary' : iv.type === 'break' ? 'bg-teal' : 'hatch-warning')} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px]">{iv.type === 'idle' ? 'Idle observation' : iv.type === 'break' ? 'Break' : 'Work session'}<span className="ml-1.5 text-[11px] text-navy-300">{label}</span></span>
          <span className="tnum block text-[11px] text-navy-300">{range(iv.startSec, iv.endSec)} · {fmtDur(dur)}{iv.queued ? ' · saved locally' : ''}</span>
        </span>
        {iv.type === 'idle' && iv.status === 'unclassified' && iv.endSec !== undefined && !iv.queued &&
        <button onClick={() => setExplaining(iv)} className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium hover:bg-white/15">Explain</button>
        }
      </li>);

  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5">
        <button onClick={() => dispatch({ type: 'AGENT_NAV', screen: 'main' })} aria-label="Back" className="rounded p-1 hover:bg-white/10"><ArrowLeftIcon className="h-4 w-4" /></button>
        <h1 className="text-sm font-semibold">Today’s timeline</h1>
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-2">
        {explaining ?
        <div className="space-y-3 py-2">
            <p className="text-[13px] font-semibold">Explain {range(explaining.startSec, explaining.endSec)}</p>
            <p className="text-xs text-navy-300">Uses the same review process and audit trail as the portal. The original observation is kept.</p>
            <label className="block text-xs font-medium" htmlFor="ag-cat">What was this time?</label>
            <select id="ag-cat" value={cat} onChange={(e) => setCat(e.target.value)} className="h-9 w-full rounded-md border border-white/15 bg-navy-800 px-2 text-[13px]">
              {inactivityCategories.filter((c) => c.id !== 'This was a break').map((c) => <option key={c.id}>{c.id}</option>)}
            </select>
            <label className="block text-xs font-medium" htmlFor="ag-reason">Explanation</label>
            <textarea id="ag-reason" value={reason} onChange={(e) => {setReason(e.target.value);setErr('');}} aria-invalid={!!err} className="min-h-[70px] w-full rounded-md border border-white/15 bg-navy-800 p-2 text-[13px] placeholder:text-navy-300" placeholder="e.g. Stand-up in the boardroom" />
            {err && <p role="alert" className="text-xs text-[#FCA5A5]">{err}</p>}
            <div className="flex gap-2">
              <button onClick={() => setExplaining(null)} className="flex-1 rounded-md bg-white/10 py-2 text-xs font-medium hover:bg-white/15">Cancel</button>
              <button onClick={submit} className="flex-1 rounded-md bg-primary py-2 text-xs font-semibold hover:bg-primary-hover">Submit for review</button>
            </div>
          </div> :

        <>
            {today.length === 0 ? <p className="py-6 text-center text-[13px] text-navy-300">No session recorded today.</p> : <ul className="divide-y divide-white/5">{today.map(row)}</ul>}
            {pendingReview.length > 0 &&
          <>
                <p className="mt-4 text-[11px] font-semibold text-navy-300">Earlier, still unexplained</p>
                <ul className="divide-y divide-white/5">{pendingReview.map(row)}</ul>
              </>
          }
          </>
        }
      </div>
      <button onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'activity' } })} className="flex items-center justify-center gap-1.5 border-t border-white/5 py-2.5 text-xs font-medium text-[#93C5FD] hover:bg-white/5">
        <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden />Open full activity in portal
      </button>
    </div>);

}