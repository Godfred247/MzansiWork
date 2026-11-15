import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CoffeeIcon, LogOutIcon, PlayIcon, RepeatIcon, RotateCcwIcon, ShieldCheckIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { breakCategories } from '../../data/projects';
import { actorId, currentWorkDate } from '../../utils/selectors';
import { dayTotals, intervalsFor } from '../../utils/selectors';
import { taskText } from '../../utils/store/timeReducer';
import { fmtClock, fmtDur, secToLabel } from '../../utils/time';
import { Button } from '../shared/Button';
import { Dialog } from '../shared/Dialog';
import { StatusBadge } from '../shared/StatusBadge';
import { BreakDialog } from './BreakDialog';
import { TaskPicker, type TaskValue } from './TaskPicker';

export function ClockPanel({ onShowSummary }: {onShowSummary: () => void;}) {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const layout = useEmployeeLayout();
  const se = state.session;
  const offline = state.employeeIssue === 'offline';
  const [task, setTask] = useState<TaskValue>({ category: 'General administration' });
  const [switchOpen, setSwitchOpen] = useState(false);
  const [switchVal, setSwitchVal] = useState<TaskValue>({ category: 'Client work' });
  const [breakOpen, setBreakOpen] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [justOut, setJustOut] = useState(false);
  const totals = dayTotals(intervalsFor(state, actorId(state), currentWorkDate(state)), clock);

  useEffect(() => {
    if (justOut && se.state === 'ended') {
      onShowSummary();
      setJustOut(false);
    }
  }, [justOut, se.state, onShowSummary]);

  const big = layout === 'narrow' ? 'text-5xl' : 'text-6xl';

  if (se.state === 'clocked_out' || se.state === 'ended') {
    const canUndo = se.state === 'ended' && se.clockOutSec !== undefined && clock - se.clockOutSec <= 600;
    return (
      <section aria-label="Clock in" className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="neutral" label={se.state === 'ended' ? `Clocked out at ${secToLabel(se.clockOutSec ?? clock)}` : 'Not clocked in'} size="md" />
          <span className="text-xs text-muted">Scheduled today · 08:00–17:00 (Standard office)</span>
        </div>
        {se.state === 'ended' ?
        <div className="mt-5">
            <p className="text-sm text-muted">Recorded work today</p>
            <p className={twMerge('tnum mt-1 font-semibold tracking-tight text-ink', big)}>{fmtDur(totals.work)}</p>
            <p className="mt-1 text-xs text-muted">Recorded attendance — not yet approved.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={onShowSummary}>View day summary</Button>
              {canUndo && <Button variant="secondary" icon={<RotateCcwIcon className="h-4 w-4" />} onClick={() => dispatch({ type: 'UNDO_CLOCK_OUT' })}>Undo clock-out</Button>}
              <Button variant="ghost" icon={<PlayIcon className="h-4 w-4" />} disabled={offline} onClick={() => dispatch({ type: 'CLOCK_IN', ...task })}>Clock in again</Button>
            </div>
            {canUndo && <p className="mt-2 text-xs text-muted">Clocked out by accident? You can undo for 10 minutes. The original event is kept in your history.</p>}
          </div> :

        <div className="mt-5 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-ink">Ready to start?</h2>
              <p className="mt-0.5 text-sm text-muted">Selecting a task is optional — you can choose or change it later.</p>
            </div>
            <TaskPicker value={task} onChange={setTask} idPrefix="ci" />
            <Button size="lg" full={layout === 'narrow'} className="h-14 px-10 text-base" icon={<PlayIcon className="h-5 w-5" />} disabled={offline} onClick={() => dispatch({ type: 'CLOCK_IN', ...task })}>
              Clock in
            </Button>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
              <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
              While clocked in, your desktop agent (if signed in) notes idle and active times only — no keystrokes, screenshots or camera.
              <button onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'policy' } })} className="font-medium text-primary hover:underline">Tracking policy</button>
            </p>
          </div>
        }
      </section>);

  }

  const onBreak = se.state === 'on_break';
  const elapsed = clock - (se.clockInSec ?? clock);
  const breakElapsed = clock - (se.breakStartSec ?? clock);
  const expected = breakCategories.find((b) => b.id === se.breakCategory)?.expectedMin ?? 15;
  const over = onBreak && breakElapsed > expected * 60;

  return (
    <section aria-label="Current work session" className={twMerge('rounded-2xl border p-6 shadow-card transition-colors duration-200', onBreak ? 'border-info-line bg-info-soft' : 'border-line bg-surface')}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={onBreak ? 'info' : 'success'} label={onBreak ? `On ${se.breakCategory?.toLowerCase()}` : 'Clocked in · working'} size="md" />
        <span className="tnum text-xs text-muted">Since {secToLabel(se.clockInSec ?? clock)} · scheduled until 17:00</span>
      </div>

      <div className={twMerge('mt-5 grid gap-6', layout === 'wide' ? 'grid-cols-[1fr_auto] items-end' : '')}>
        <div>
          <p className="text-sm text-muted">{onBreak ? 'Break time' : 'Recorded attendance'}</p>
          <motion.p key={onBreak ? 'b' : 'w'} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className={twMerge('tnum mt-1 font-semibold tracking-tight', big, onBreak ? 'text-info' : 'text-ink')} aria-live="off">
            {fmtClock(onBreak ? breakElapsed : elapsed)}
          </motion.p>
          <p className="mt-1 text-xs text-muted">
            {onBreak ?
            `Started ${secToLabel(se.breakStartSec ?? clock)} · usually ${expected} min · total breaks today ${fmtDur(totals.breaks)}` :
            'Not yet approved — breaks, policy rules and reviews may change your final timesheet.'}
          </p>
          {over && <p className="mt-2 text-xs font-medium text-warning">Longer than the usual {expected} minutes — that’s fine, just end the break when you’re back.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {onBreak ?
          <Button size="lg" icon={<PlayIcon className="h-4 w-4" />} disabled={offline} onClick={() => dispatch({ type: 'END_BREAK' })}>End break</Button> :

          <Button size="lg" variant="secondary" icon={<CoffeeIcon className="h-4 w-4" />} disabled={offline} onClick={() => setBreakOpen(true)}>Take a break</Button>
          }
          <Button size="lg" variant="dark" icon={<LogOutIcon className="h-4 w-4" />} disabled={offline} onClick={() => setConfirmOut(true)}>Clock out</Button>
        </div>
      </div>

      {!onBreak &&
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div className="min-w-0">
            <p className="text-xs text-muted">Working on</p>
            <p className="truncate text-sm font-medium text-ink">{taskText(state, se.projectId, se.taskId, se.category)}</p>
          </div>
          <Button size="sm" variant="secondary" icon={<RepeatIcon className="h-3.5 w-3.5" />} disabled={offline} onClick={() => {setSwitchVal({ projectId: se.projectId, taskId: se.taskId, category: se.category });setSwitchOpen(true);}}>
            Switch task
          </Button>
        </div>
      }

      <BreakDialog open={breakOpen} onClose={() => setBreakOpen(false)} onStart={(c) => {dispatch({ type: 'START_BREAK', category: c });setBreakOpen(false);}} />

      <Dialog
        open={switchOpen}
        onClose={() => setSwitchOpen(false)}
        title="Switch task"
        description="Time from now is recorded against the new task."
        size="lg"
        footer={<><Button variant="secondary" onClick={() => setSwitchOpen(false)}>Cancel</Button><Button onClick={() => {dispatch({ type: 'SWITCH_TASK', ...switchVal });setSwitchOpen(false);}}>Switch</Button></>}>
        
        <TaskPicker value={switchVal} onChange={setSwitchVal} idPrefix="sw" />
      </Dialog>

      <Dialog
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        size="sm"
        title={`Clock out at ${secToLabel(clock)}?`}
        description={onBreak ? 'Your break will end and your work session will close.' : 'This ends your work session for today. You’ll see a summary next.'}
        footer={<><Button variant="secondary" onClick={() => setConfirmOut(false)}>Keep working</Button><Button variant="dark" onClick={() => {dispatch({ type: 'CLOCK_OUT' });setConfirmOut(false);setJustOut(true);}}>Clock out</Button></>}>
        
        <p className="tnum text-sm text-muted">Recorded so far: <strong className="text-ink">{fmtDur(totals.work)}</strong> work · {fmtDur(totals.breaks)} breaks.</p>
      </Dialog>
    </section>);

}