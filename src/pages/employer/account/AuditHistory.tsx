import { useState } from 'react';
import { ScrollTextIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { AccessDenied } from '../../../components/shared/AccessDenied';
import { EmptyState } from '../../../components/shared/EmptyState';
import { SelectInput } from '../../../components/shared/SelectInput';
import { useDemo } from '../../../contexts/DemoStore';
import type { AuditCategory } from '../../../types/org';
import { can, viewerRoleLabel } from '../../../utils/permissions';
import { fmtDate } from '../../../utils/time';

const categories: {value: 'all' | AuditCategory;label: string;}[] = [
{ value: 'all', label: 'All activity' },
{ value: 'invitation', label: 'Invitations' },
{ value: 'role', label: 'Roles' },
{ value: 'attendance', label: 'Attendance' },
{ value: 'correction', label: 'Corrections' },
{ value: 'leave', label: 'Leave' },
{ value: 'policy', label: 'Policy' },
{ value: 'subscription', label: 'Subscription' },
{ value: 'export', label: 'Exports' },
{ value: 'security', label: 'Security' },
{ value: 'member', label: 'People' }];

export function AuditHistory() {
  const { state } = useDemo();
  const [category, setCategory] = useState<(typeof categories)[number]['value']>('all');

  if (!can(state.viewerRole, 'view_audit')) {
    return (
      <>
        <MobileHeader title="Audit history" />
        <ScreenBody>
          <AccessDenied
            title="Audit history is restricted"
            body="You can see decisions you are allowed to make. The full administrative history is limited to the owner and scoped managers."
            attempted="GET /api/organisations/mzansiwork/audit"
            role={viewerRoleLabel(state.viewerRole)} />
        </ScreenBody>
      </>);
  }

  const rows = state.audit.filter((a) => category === 'all' || a.category === category);

  return (
    <>
      <MobileHeader title="Audit history" subtitle="Original events stay even after a correction is approved" />
      <ScreenBody>
        <SelectInput aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value as typeof category)} options={categories} />
        {rows.length === 0 ?
        <EmptyState icon={ScrollTextIcon} title="No events in this category" body="Try another filter. New approvals, invitations and exports are added here as they happen." /> :
        <MSection footer="Actor, action, time and reason are kept. This view does not rewrite history.">
            {rows.map((a) =>
          <MRow
            key={a.id}
            title={a.action}
            subtitle={`${a.actor} · ${fmtDate(a.date, 'd MMM')} ${a.time} · ${a.target}${a.reason ? ` — ${a.reason}` : ''}`}
            chevron={false} />
          )}
          </MSection>
        }
      </ScreenBody>
    </>);
}
