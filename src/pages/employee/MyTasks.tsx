import { PlayIcon, RepeatIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { PageHeader } from '../../components/employee/PageHeader';
import { Button } from '../../components/shared/Button';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { actorId } from '../../utils/selectors';
import { fmtDur } from '../../utils/time';

export function MyTasks() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const layout = useEmployeeLayout();
  const se = state.session;
  const active = se.state === 'clocked_in';
  const mine = state.projects.filter((p) => p.members.includes(actorId(state)));
  const hoursFor = (pid: string, tid: string) =>
  state.intervals.
  filter((i) => i.memberId === actorId(state) && i.type === 'work' && i.projectId === pid && i.taskId === tid && i.date >= '2026-10-19').
  reduce((a, i) => a + ((i.endSec ?? clock) - i.startSec), 0);

  return (
    <div className={twMerge('mx-auto max-w-5xl', layout === 'narrow' ? 'space-y-4 p-4' : 'space-y-6 p-8')}>
      <PageHeader title="My Tasks" description="Projects and tasks assigned to you. Time is recorded against the task you select." />
      {mine.map((p) =>
      <section key={p.id} aria-labelledby={`p-${p.id}`} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
            <div>
              <h2 id={`p-${p.id}`} className="text-sm font-semibold text-ink">{p.name}</h2>
              <p className="text-xs text-muted">{p.client ?? 'Internal'} · {p.description}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge tone={p.billable ? 'primary' : 'neutral'} label={p.billable ? 'Billable' : 'Non-billable'} />
              <StatusBadge tone={p.status === 'active' ? 'success' : 'neutral'} label={p.status === 'active' ? 'Active' : 'Paused'} />
            </div>
          </div>
          <ul className="divide-y divide-line">
            {p.tasks.filter((t) => t.assignees.includes(actorId(state))).map((t) => {
            const current = (se.state === 'clocked_in' || se.state === 'on_break') && se.taskId === t.id;
            return (
              <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{t.name}</p>
                    <p className="tnum text-xs text-muted">{fmtDur(hoursFor(p.id, t.id))} recorded since 19 Oct</p>
                  </div>
                  {current ?
                <StatusBadge tone="success" label="Working on this now" size="md" /> :
                active ?
                <Button size="sm" variant="secondary" icon={<RepeatIcon className="h-3.5 w-3.5" />} onClick={() => dispatch({ type: 'SWITCH_TASK', projectId: p.id, taskId: t.id, category: p.billable ? 'Client work' : 'Internal projects' })}>Switch to this</Button> :
                se.state === 'on_break' ? null :
                <Button size="sm" variant="secondary" icon={<PlayIcon className="h-3.5 w-3.5" />} disabled={state.employeeIssue === 'offline'} onClick={() => dispatch({ type: 'CLOCK_IN', projectId: p.id, taskId: t.id, category: p.billable ? 'Client work' : 'Internal projects' })}>Clock in on this</Button>
                }
                </li>);

          })}
          </ul>
        </section>
      )}
    </div>);

}