import { BellIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Button } from '../../../components/shared/Button';
import { EmptyState } from '../../../components/shared/EmptyState';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../contexts/DemoStore';
import type { Tone } from '../../../types/org';
import { fmtDate } from '../../../utils/time';

export function EmployerNotifications() {
  const { state, dispatch } = useDemo();
  const items = state.notifications.filter((n) => n.app === 'employer');
  const unread = items.filter((n) => !n.read).length;

  const open = (title: string) => {
    if (title.toLowerCase().includes('leave')) dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'approvals', params: { tab: 'leave' } } });
    else if (title.toLowerCase().includes('correction') || title.toLowerCase().includes('clock')) dispatch({ type: 'EMPLOYER_TAB', tab: 'approvals' });
    else if (title.toLowerCase().includes('payment') || title.toLowerCase().includes('renewal') || title.toLowerCase().includes('plan')) dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'subscription' } });
  };

  return (
    <>
      <MobileHeader
        title="Notifications"
        actions={unread > 0 ? <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'MARK_READ', app: 'employer' })}>Mark read</Button> : undefined} />
      <ScreenBody>
        {items.length === 0 ?
        <EmptyState icon={BellIcon} title="You’re up to date" body="Approvals, payment issues and policy changes will appear here and by email when that is switched on." /> :
        <MSection title={unread ? `${unread} unread` : 'Earlier'} footer="Messages are factual and do not accuse an employee of not working.">
            {items.map((n) =>
          <MRow
            key={n.id}
            title={n.title}
            subtitle={`${n.body} · ${fmtDate(n.date, 'd MMM')} ${n.time}`}
            trailing={n.read ? undefined : <StatusBadge tone={n.tone as Tone} label="New" hideIcon />}
            onClick={() => open(n.title)} />
          )}
          </MSection>
        }
      </ScreenBody>
    </>);
}
