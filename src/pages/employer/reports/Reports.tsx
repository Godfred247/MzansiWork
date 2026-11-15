import { FileBarChartIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { AccessDenied } from '../../../components/shared/AccessDenied';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../contexts/DemoStore';
import { reports, type ReportDataType } from '../../../data/reports';
import { can, viewerRoleLabel } from '../../../utils/permissions';

const tone: Record<ReportDataType, 'info' | 'warning' | 'success' | 'neutral' | 'primary'> = {
  'Raw observations': 'info',
  'Employee-submitted corrections': 'warning',
  'Approved timesheet values': 'success',
  'Finalised records': 'primary',
  'Mixed — labelled per column': 'neutral'
};

export function Reports() {
  const { state, dispatch } = useDemo();
  if (!can(state.viewerRole, 'view_reports')) {
    return (
      <>
        <MobileHeader title="Reports" />
        <ScreenBody>
          <AccessDenied
            title="Reports are outside your role"
            body="This account can review assigned requests, but organisation reports are not included. Ask the owner if you need a report."
            attempted="GET /api/organisations/mzansiwork/reports"
            role={viewerRoleLabel(state.viewerRole)} />
        </ScreenBody>
      </>);
  }

  const groups = ['Attendance', 'Timesheets', 'Review', 'Leave', 'Administration'] as const;

  return (
    <>
      <MobileHeader title="Reports" subtitle="Raw hours and approved hours are labelled separately" />
      <ScreenBody>
        {groups.map((group) =>
        <MSection key={group} title={group}>
            {reports.filter((r) => r.group === group).map((r) =>
          <MRow
            key={r.id}
            leading={<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary"><FileBarChartIcon className="h-4 w-4" aria-hidden /></span>}
            title={r.name}
            subtitle={r.description}
            trailing={<StatusBadge tone={tone[r.dataType]} label={r.dataType === 'Mixed — labelled per column' ? 'Mixed' : r.dataType.split(' ')[0]} />}
            onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'report', params: { id: r.id } } })} />
          )}
          </MSection>
        )}
      </ScreenBody>
    </>);
}
