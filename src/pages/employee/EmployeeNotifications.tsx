import { AlertTriangleIcon, BellIcon, CheckCircle2Icon, InfoIcon, XCircleIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { PageHeader } from '../../components/employee/PageHeader';
import { Button } from '../../components/shared/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { fmtDate } from '../../utils/time';

const icons = { success: CheckCircle2Icon, warning: AlertTriangleIcon, danger: XCircleIcon, info: InfoIcon, neutral: InfoIcon, primary: InfoIcon };
const colors = { success: 'bg-success-soft text-success', warning: 'bg-warning-soft text-warning', danger: 'bg-danger-soft text-danger', info: 'bg-info-soft text-info', neutral: 'bg-hover text-muted', primary: 'bg-primary-soft text-primary' };

export function EmployeeNotifications() {
  const { state, dispatch } = useDemo();
  const layout = useEmployeeLayout();
  const list = state.notifications.filter((n) => n.app === 'employee');
  const unread = list.filter((n) => !n.read).length;

  return (
    <div className={twMerge('mx-auto max-w-3xl', layout === 'narrow' ? 'space-y-4 p-4' : 'space-y-6 p-8')}>
      <PageHeader
        title="Notifications"
        description="In-app notifications. Email copies follow your notification preferences."
        actions={unread > 0 ? <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'MARK_READ', app: 'employee' })}>Mark all as read</Button> : undefined} />
      
      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        {list.length === 0 ?
        <EmptyState icon={BellIcon} title="No notifications" body="Updates about your timesheets, leave and account will appear here." /> :

        <ul className="divide-y divide-line">
            {list.map((n) => {
            const Icon = icons[n.tone];
            return (
              <li key={n.id} className={twMerge('flex gap-3 px-5 py-4', !n.read && 'bg-primary-soft/40')}>
                  <span className={twMerge('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', colors[n.tone])}><Icon className="h-4 w-4" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium text-ink">
                      {n.title}
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" />}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">{n.body}</p>
                  </div>
                  <span className="tnum shrink-0 text-xs text-subtle">{fmtDate(n.date, 'd MMM')} {n.time}</span>
                </li>);

          })}
          </ul>
        }
      </section>
    </div>);

}