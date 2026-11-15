import { DownloadIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { AccessDenied } from '../../../components/shared/AccessDenied';
import { Button } from '../../../components/shared/Button';
import { EmptyState } from '../../../components/shared/EmptyState';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../contexts/DemoStore';
import { downloadExport, hasExportFile } from '../../../utils/exportFiles';
import { can, viewerRoleLabel } from '../../../utils/permissions';
import { fmtDate } from '../../../utils/time';

export function ExportCentre() {
  const { state } = useDemo();
  if (!can(state.viewerRole, 'export') && !can(state.viewerRole, 'view_reports')) {
    return (
      <>
        <MobileHeader title="Export centre" />
        <ScreenBody>
          <AccessDenied
            title="Exports are restricted"
            body="You can only download data your role is allowed to see. This account does not have export permission."
            attempted="GET /api/organisations/mzansiwork/exports"
            role={viewerRoleLabel(state.viewerRole)} />
        </ScreenBody>
      </>);
  }

  const jobs = state.exports;

  return (
    <>
      <MobileHeader title="Export centre" subtitle="CSV, Excel and PDF files download to this device" />
      <ScreenBody>
        {jobs.length === 0 ?
        <EmptyState icon={DownloadIcon} title="No exports yet" body="Open a report and choose CSV, Excel or PDF. The job will appear here with its status." /> :
        <MSection title="Recent jobs" footer="Each file states whether it contains raw observations, corrections, or approved hours. Older demo records were created before downloads were stored on this device.">
            {jobs.map((job) =>
          <MRow
            key={job.id}
            title={`${job.report} · ${job.format}`}
            subtitle={`${job.range} · ${job.dataType} · ${fmtDate(job.date, 'd MMM')} ${job.time}${job.rows ? ` · ${job.rows} rows` : ''}`}
            trailing={
              <span className="flex items-center gap-2">
                {job.status === 'done' && hasExportFile(job.id) && <Button size="sm" onClick={() => downloadExport(job.id)}>Download</Button>}
                <StatusBadge tone={job.status === 'done' ? 'success' : job.status === 'failed' ? 'danger' : 'info'} label={job.status === 'running' ? 'In progress' : job.status === 'done' ? 'Ready' : 'Failed'} />
              </span>
            }
            chevron={false} />
          )}
          </MSection>
        }
        <p className="px-1 text-xs leading-relaxed text-muted">The API writes the same file after checking your permission. A download from this screen is the report you just generated.</p>
      </ScreenBody>
    </>);
}
