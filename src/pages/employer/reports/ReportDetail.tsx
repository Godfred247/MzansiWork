import { useMemo, useState } from 'react';
import { FileBarChartIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { EmptyState } from '../../../components/shared/EmptyState';
import { SelectInput } from '../../../components/shared/SelectInput';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../contexts/DemoStore';
import { dataTypeHelp, reports } from '../../../data/reports';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import type { ExportFormat } from '../../../types/billing';
import { downloadExport, storeExportFile } from '../../../utils/exportFiles';
import { can } from '../../../utils/permissions';

const ranges = ['This week · 20–26 Oct 2026', 'This month · Oct 2026', 'Last month · Sep 2026'];

export function ReportDetail() {
  const { state, dispatch } = useDemo();
  const { id } = useEmployerParams();
  const report = reports.find((r) => r.id === (id || 'weekly')) ?? reports.find((r) => r.id === 'weekly')!;
  const [range, setRange] = useState(ranges[0]);
  const [status, setStatus] = useState('All');
  const [dept, setDept] = useState('All departments');

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set(report.rows.map((row) => String(row[row.length - 1]))));
    return ['All', ...values];
  }, [report]);

  const rows = report.rows.filter((row) => status === 'All' || String(row[row.length - 1]) === status);
  const max = Math.max(...(report.chart?.map((c) => c.value) ?? [1]), 1);
  const job = state.exports.find((e) => e.report === report.name && e.range === range);
  const mayExport = can(state.viewerRole, 'export');

  const start = (format: ExportFormat, willFail = false) => {
    const id = `x-${Date.now()}`;
    if (!willFail) storeExportFile(id, report, rows, format, range);
    dispatch({
      type: 'EXPORT_START',
      id,
      report: report.name,
      format,
      range,
      dataType: report.dataType,
      willFail
    });
  };

  return (
    <>
      <MobileHeader title={report.name} subtitle={report.group} />
      <ScreenBody>
        <Banner tone="info" title={report.dataType}>{dataTypeHelp[report.dataType]}</Banner>
        <MSection title="Filters">
          <div className="space-y-3 p-4">
            <SelectInput aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)} options={ranges.map((r) => ({ value: r, label: r }))} />
            {report.filters.some((f) => f.toLowerCase().includes('department')) &&
            <SelectInput aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)} options={['All departments', 'Design', 'Engineering', 'Operations', 'Leadership'].map((d) => ({ value: d, label: d }))} />
            }
            {report.filters.some((f) => f.toLowerCase().includes('status') || f.toLowerCase().includes('approval')) &&
            <SelectInput aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions.map((s) => ({ value: s, label: s }))} />
            }
            <p className="text-xs text-muted">Showing {dept === 'All departments' ? 'all departments' : dept}. Only filters that apply to this report are shown.</p>
          </div>
        </MSection>

        {report.chart &&
        <MSection title="Summary">
            <div className="space-y-2.5 p-4">
              {report.chart.map((c) =>
            <div key={c.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-ink">{c.label}</span>
                    <span className="tnum text-muted">{c.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-hover">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${c.value / max * 100}%` }} />
                  </div>
                </div>
            )}
            </div>
          </MSection>
        }

        {rows.length === 0 ?
        <EmptyState icon={FileBarChartIcon} title="No rows for this filter" body="Try another status or a wider date range. The report itself is still available." /> :
        <MSection title={`${rows.length} row${rows.length === 1 ? '' : 's'}`} footer="Demo figures for Karoo Digital. The download is a real CSV, Excel or PDF file for these rows.">
            {rows.map((row, i) =>
          <MRow
            key={`${row[0]}-${i}`}
            title={String(row[0])}
            subtitle={report.columns.slice(1).map((col, idx) => `${col}: ${row[idx + 1]}`).join(' · ')}
            chevron={false} />
          )}
          </MSection>
        }

        <MSection title="Export" footer={mayExport ? 'The file respects your permissions. A simulated failure is available so you can see the error state.' : 'Your role cannot export. Ask the owner to grant export permission.'}>
          <div className="space-y-2 p-4">
            <div className="flex gap-2">
              <Button full size="sm" disabled={!mayExport} onClick={() => start('CSV')}>CSV</Button>
              <Button full size="sm" variant="secondary" disabled={!mayExport} onClick={() => start('Excel')}>Excel</Button>
              <Button full size="sm" variant="secondary" disabled={!mayExport} onClick={() => start('PDF')}>PDF</Button>
            </div>
            {mayExport && <Button full size="sm" variant="ghost" onClick={() => start('CSV', true)}>Simulate a failed export</Button>}
            {job &&
            <div className="flex items-center justify-between gap-2 rounded-lg bg-hover px-3 py-2">
                <div>
                  <p className="text-[13px] font-medium text-ink">{job.format} · {job.status === 'running' ? 'Preparing…' : job.status === 'done' ? 'Ready' : 'Failed'}</p>
                  <p className="text-xs text-muted">{job.status === 'done' ? `${job.rows ?? rows.length} rows · file is ready to download` : job.status === 'failed' ? 'Try a shorter date range.' : 'This usually takes a couple of seconds.'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {job.status === 'done' && <Button size="sm" onClick={() => downloadExport(job.id)}>Download</Button>}
                  <StatusBadge tone={job.status === 'done' ? 'success' : job.status === 'failed' ? 'danger' : 'info'} label={job.status === 'running' ? 'In progress' : job.status === 'done' ? 'Ready' : 'Failed'} />
                </div>
              </div>
            }
            <Button full variant="ghost" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'exports' } })}>Open export centre</Button>
          </div>
        </MSection>
      </ScreenBody>
    </>);
}
