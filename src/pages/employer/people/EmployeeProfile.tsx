import { useState } from 'react';
import { ClipboardCheckIcon, KeyRoundIcon, PencilIcon, ShieldIcon, UserCheckIcon, UserMinusIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ApiError, readToken } from '../../../api/client';
import { saveLeaveOpening } from '../../../api/leave';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { RowIcon } from '../../../components/employer/RowIcon';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Avatar } from '../../../components/shared/Avatar';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { SelectInput } from '../../../components/shared/SelectInput';
import { Sheet } from '../../../components/shared/Sheet';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { TextArea } from '../../../components/shared/TextArea';
import { TextInput } from '../../../components/shared/TextInput';
import { TimelineBar } from '../../../components/shared/TimelineBar';
import { useClock, useDemo } from '../../../contexts/DemoStore';
import { annualBalances, memberWeek } from '../../../data/dashboard';
import { attendanceLabels, intervalLabels, leaveLabels } from '../../../data/statusLabels';
import { labelLeave, shownBalances } from '../../../utils/leavePolicy';
import { isLiveOrg } from '../../../utils/workspace';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import type { Role } from '../../../types/org';
import { can } from '../../../utils/permissions';
import { liveMembers, memberDayIntervals } from '../../../utils/selectors';
import { fmtDate, fmtDur, johannesburgNow, range } from '../../../utils/time';

const tabs = ['Overview', 'Attendance', 'Timesheets', 'Leave', 'Tasks', 'Activity', 'Audit'] as const;
type Tab = (typeof tabs)[number];

export function EmployeeProfile() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const { id } = useEmployerParams();
  const role = state.viewerRole;
  const m = liveMembers(state, clock, true).find((x) => x.id === id);
  const [tab, setTab] = useState<Tab>('Overview');
  const [sheet, setSheet] = useState<'role' | 'deactivate' | 'edit' | 'approver' | null>(null);
  const [approverId, setApproverId] = useState('');
  const [newRole, setNewRole] = useState<Role>(m?.role ?? 'employee');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);
  if (!m) return <MobileHeader title="Not found" />;
  const manage = can(role, 'manage_employees') && m.role !== 'owner';
  const first = m.name.split(' ')[0];
  const idle = state.intervals.filter((i) => i.memberId === m.id && i.type === 'idle' && !i.queued);

  return (
    <>
      <MobileHeader title={m.name} />
      <ScreenBody className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={m.name} size="lg" />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-ink">{m.name}</p>
            <p className="truncate text-xs text-muted">{m.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <StatusBadge tone={m.status === 'active' ? 'success' : 'neutral'} label={m.status === 'active' ? 'Active' : `Inactive since ${fmtDate(m.deactivatedOn ?? '2026-08-29', 'd MMM')}`} />
              {m.status === 'active' && <StatusBadge tone={attendanceLabels[m.attendance].tone} label={attendanceLabels[m.attendance].label} />}
            </div>
          </div>
        </div>

        <div className="scroll-none -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4" role="tablist" aria-label="Profile sections">
          {tabs.map((t) =>
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={twMerge('shrink-0 border-b-2 px-2.5 pb-2 text-[13px] font-medium', tab === t ? 'border-primary text-primary' : 'border-transparent text-muted')}>{t}</button>
          )}
        </div>

        {tab === 'Overview' &&
        <>
            <MSection title="Employment">
              <MRow title="Role" trailing={<span className="text-sm capitalize text-ink">{m.role}</span>} />
              <MRow title="Title" trailing={<span className="text-sm text-ink">{m.title}</span>} />
              <MRow title="Timesheet and leave approver" trailing={<span className="max-w-[9.5rem] truncate text-sm text-ink">{state.members.find((person) => person.id === state.approverFor[m.id])?.name ?? 'Not chosen'}</span>} />
              <MRow title="Department · branch" trailing={<span className="text-sm text-ink">{m.department} · {m.branch}</span>} />
              <MRow title="Schedule" trailing={<span className="text-sm text-ink">{m.schedule.days} {m.schedule.start}–{m.schedule.end}</span>} />
              <MRow title="Start date" trailing={<span className="tnum text-sm text-ink">{fmtDate(m.startDate, 'd MMM yyyy')}</span>} />
              {isLiveOrg(state.orgId) && !state.flow ?
              shownBalances(state, m.id).map((balance) => <MRow key={balance.code} title={balance.name} subtitle={balance.next || balance.badge} trailing={<span className="tnum text-sm text-ink">{balance.available === null ? 'Not set' : `${balance.available} days`}</span>} />) :
              <MRow title="Annual leave balance" trailing={<span className="tnum text-sm text-ink">{annualBalances[m.id] ?? '—'} days</span>} />}
              <MRow title="Desktop agent" trailing={<span className="text-sm text-ink">{m.usesAgent ? 'In use' : 'Not used'}</span>} />
            </MSection>
            {manage &&
          <MSection title="Manage" footer="Deactivation never deletes attendance, timesheets, leave or audit history.">
                <MRow leading={<RowIcon icon={PencilIcon} tone="neutral" />} title="Edit department or branch" onClick={() => setSheet('edit')} />
                {can(role, 'manage_roles') && <MRow leading={<RowIcon icon={ShieldIcon} tone="navy" />} title="Change role" onClick={() => setSheet('role')} />}
                {can(role, 'manage_roles') && <MRow leading={<RowIcon icon={ClipboardCheckIcon} tone="teal" />} title="Choose timesheet and leave approver" subtitle="Not taken from their manager" onClick={() => { setApproverId(state.approverFor[m.id] ?? ''); setSheet('approver'); }} />}
                <MRow leading={<RowIcon icon={KeyRoundIcon} tone="neutral" />} title="Send password reset link" subtitle="Admins can never view or set passwords" onClick={() => dispatch({ type: 'AUDIT_LOG', category: 'security', action: 'Sent password reset link', target: m.name, toast: `Reset link emailed to ${first} (simulated)` })} />
                {m.status === 'active' ?
            <MRow leading={<RowIcon icon={UserMinusIcon} tone="danger" />} title="Deactivate employee" danger onClick={() => setSheet('deactivate')} /> :

            <MRow leading={<RowIcon icon={UserCheckIcon} tone="success" />} title="Reactivate employee" subtitle="Uses 1 seat" onClick={() => dispatch({ type: 'REACTIVATE_MEMBER', id: m.id })} />
            }
              </MSection>
          }
          </>
        }

        {tab === 'Attendance' &&
        <MSection title="Today">
            <div className="p-4"><TimelineBar intervals={memberDayIntervals(state, m, clock)} now={clock} /></div>
            <MRow title="Open full attendance detail" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'attendance-detail', params: { id: m.id } } })} />
          </MSection>
        }

        {tab === 'Timesheets' &&
        <MSection title="Week of 19–23 Oct" footer="Approved values. Pending corrections are not applied until approved.">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) =>
          <MRow key={d} title={`${d} ${19 + i} Oct`} trailing={<><span className="tnum text-sm text-ink">{(memberWeek[m.id]?.hours[i] ?? 0).toFixed(1)} h</span><StatusBadge tone={memberWeek[m.id]?.approved ? 'success' : 'warning'} label={memberWeek[m.id]?.approved ? 'Approved' : 'Pending'} /></>} />
          )}
          </MSection>
        }

        {tab === 'Leave' &&
        <MSection title="Requests">
            {state.leave.filter((l) => l.memberId === m.id).length === 0 ? <MRow title="No leave requests" /> : state.leave.filter((l) => l.memberId === m.id).map((l) =>
          <MRow key={l.id} title={labelLeave(state.leavePolicies, l.type)} subtitle={`${fmtDate(l.start, 'd MMM')}–${fmtDate(l.end, 'd MMM')} · ${l.days} days`} trailing={<StatusBadge tone={leaveLabels[l.status].tone} label={leaveLabels[l.status].label} />} onClick={l.status === 'pending' ? () => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'leave-request', params: { id: l.id } } }) : undefined} />
          )}
          </MSection>
        }

        {tab === 'Leave' && state.viewerRole === 'owner' && isLiveOrg(state.orgId) && !state.flow && <StartingBalance memberId={m.id} />}
        {tab === 'Tasks' &&
        <MSection title="Projects">
            {state.projects.filter((p) => p.members.includes(m.id)).map((p) => <MRow key={p.id} title={p.name} subtitle={p.tasks.filter((t) => t.assignees.includes(m.id)).map((t) => t.name).join(', ') || 'No tasks assigned'} trailing={<StatusBadge tone={p.billable ? 'primary' : 'neutral'} label={p.billable ? 'Billable' : 'Internal'} />} />)}
          </MSection>
        }

        {tab === 'Activity' &&
        <MSection title="Inactivity observations" footer="Observations from the desktop agent. They are not proof that no work took place.">
            {!can(role, 'view_activity') ? <MRow title="Restricted by your permissions" /> : idle.length === 0 ? <MRow title="No observations" subtitle={m.usesAgent ? 'Nothing recorded recently' : 'This employee doesn’t use the desktop agent'} /> : idle.map((iv) =>
          <MRow key={iv.id} title={<span className="tnum">{fmtDate(iv.date, 'd MMM')} · {range(iv.startSec, iv.endSec)}</span>} subtitle={`${fmtDur((iv.endSec ?? clock) - iv.startSec)}${iv.classification ? ` · ${iv.classification}` : ''}`} trailing={<StatusBadge tone={intervalLabels[iv.status].tone} label={intervalLabels[iv.status].label} />} />
          )}
          </MSection>
        }

        {tab === 'Audit' &&
        <MSection title="Audit history">
            {!can(role, 'view_audit') ? <MRow title="Restricted" subtitle="Your role can’t view audit history." /> : state.audit.filter((a) => a.target.includes(m.name) || a.actor === m.name).map((a) => <MRow key={a.id} title={a.action} subtitle={`${a.actor} · ${fmtDate(a.date, 'd MMM')} ${a.time}${a.reason ? ` · “${a.reason}”` : ''}`} />)}
          </MSection>
        }
      </ScreenBody>

      <Sheet open={sheet === 'role'} onClose={() => setSheet(null)} title={`Change ${first}’s role`} description="Billing access is never included in any role change — only the owner can delegate it explicitly." footer={<Button full onClick={() => {dispatch({ type: 'CHANGE_ROLE', id: m.id, role: newRole });setSheet(null);}}>Save role</Button>}>
        <Field label="Role" htmlFor="pr-role"><SelectInput id="pr-role" value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} options={[{ value: 'employee', label: 'Employee — own records' }, { value: 'approver', label: 'Delegated approver — scoped approvals' }, { value: 'manager', label: 'Manager — assigned team' }]} /></Field>
      </Sheet>

      <Sheet open={sheet === 'approver'} onClose={() => setSheet(null)} title={`Who approves ${first}?`} description="Pick anyone in the organisation. Their manager role is not used, and nobody is selected until you save a name." footer={<Button full onClick={() => { dispatch({ type: 'SET_APPROVER', memberId: m.id, approverId: approverId || null }); setSheet(null); }}>Save approver</Button>}>
        <Field label="Approver" htmlFor="pe-approver">
          <SelectInput
            id="pe-approver"
            value={approverId}
            onChange={(event) => setApproverId(event.target.value)}
            options={[{ value: '', label: 'Not chosen' }, ...state.members.filter((person) => person.status === 'active' && person.id !== m.id).map((person) => ({ value: person.id, label: `${person.name} · ${person.role}` }))]} />
        </Field>
      </Sheet>

      <Sheet open={sheet === 'edit'} onClose={() => setSheet(null)} title="Edit details" footer={<Button full onClick={() => {dispatch({ type: 'AUDIT_LOG', category: 'member', action: 'Updated employee details', target: m.name, toast: 'Details saved' });setSheet(null);}}>Save</Button>}>
        <div className="space-y-4">
          <Field label="Department" htmlFor="pe-d"><SelectInput id="pe-d" defaultValue={m.department} options={['Design', 'Engineering', 'Client Services', 'Operations', 'Marketing'].map((d) => ({ value: d, label: d }))} /></Field>
          <Field label="Branch" htmlFor="pe-b"><SelectInput id="pe-b" defaultValue={m.branch} options={[{ value: 'Cape Town', label: 'Cape Town' }, { value: 'Johannesburg', label: 'Johannesburg' }]} /></Field>
        </div>
      </Sheet>

      <Sheet open={sheet === 'deactivate'} onClose={() => setSheet(null)} title={`Deactivate ${first}?`} description={`${first} will lose access and release 1 seat. All attendance, approved timesheets, leave records and audit history are kept.`} footer={
      <div className="flex gap-2">
          <Button full variant="secondary" onClick={() => setSheet(null)}>Cancel</Button>
          <Button full variant="danger" onClick={() => {setTried(true);if (reason.trim().length < 5) return;dispatch({ type: 'DEACTIVATE_MEMBER', id: m.id, reason: reason.trim() });setSheet(null);setReason('');setTried(false);}}>Deactivate</Button>
        </div>
      }>
        <Field label="Reason (recorded in audit history)" htmlFor="pd-r" error={tried && reason.trim().length < 5 ? 'Please add a short reason.' : ''}>
          <TextArea id="pd-r" value={reason} invalid={tried && reason.trim().length < 5} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Resigned — last working day 30 Oct" />
        </Field>
      </Sheet>
    </>);

}

function StartingBalance({ memberId }: { memberId: string }) {
  const { state, dispatch } = useDemo();
  const tracked = state.leavePolicies.filter((policy) => policy.tracksDays && policy.grant !== 'none');
  const [policyId, setPolicyId] = useState(tracked[0]?.id ?? '');
  const [days, setDays] = useState('');
  const [asOf, setAsOf] = useState(johannesburgNow().iso);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  if (tracked.length === 0) return null;

  const save = async () => {
    const token = readToken('employer');
    const amount = Number(days);
    if (!token) {
      setError('Sign in again to save a starting balance.');
      return;
    }
    if (!policyId || !Number.isFinite(amount) || amount < 0 || amount > 60) {
      setError('Enter a starting balance between 0 and 60 days.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveLeaveOpening(token, { policyId, userId: memberId, openingDays: amount, asOf });
      const openings = [...state.leaveOpenings.filter((opening) => !(opening.policyId === policyId && opening.userId === memberId)), { policyId, userId: memberId, openingDays: amount, asOf }];
      dispatch({ type: 'SET_LEAVE_SETUP', policies: state.leavePolicies, openings });
      dispatch({ type: 'TOAST', app: 'employer', message: 'Starting balance saved. Later approved leave is taken off it.', tone: 'success' });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'The starting balance was not saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MSection title="Starting balance" footer="Use this when someone joins part-way through a cycle. It is the number of days they already had on the date you choose. It is not a statutory balance.">
      <div className="space-y-3 p-4">
        <Field label="Leave type" htmlFor="open-type">
          <SelectInput id="open-type" value={policyId} onChange={(event) => setPolicyId(event.target.value)} options={tracked.map((policy) => ({ value: policy.id, label: policy.name }))} />
        </Field>
        <Field label="Days they had" htmlFor="open-days">
          <TextInput id="open-days" inputMode="decimal" value={days} onChange={(event) => setDays(event.target.value)} placeholder="4" />
        </Field>
        <Field label="On this date" htmlFor="open-date">
          <TextInput id="open-date" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} />
        </Field>
        {error && <p role="alert" className="text-xs text-danger-dark">{error}</p>}
        <Button full loading={saving} onClick={() => { void save(); }}>Save starting balance</Button>
      </div>
    </MSection>
  );
}