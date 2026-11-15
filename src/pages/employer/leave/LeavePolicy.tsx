import { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { ApiError, readToken } from '../../../api/client';
import { saveLeavePolicies } from '../../../api/leave';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { SelectInput } from '../../../components/shared/SelectInput';
import { TextArea } from '../../../components/shared/TextArea';
import { TextInput } from '../../../components/shared/TextInput';
import { useDemo } from '../../../contexts/DemoStore';
import type { LeavePolicy } from '../../../types/time';
import { formatDays, grantSummary, leaveCode, starterPolicies } from '../../../utils/leavePolicy';
import { johannesburgNow } from '../../../utils/time';
import { isLiveOrg } from '../../../utils/workspace';

const blank = (sort: number): LeavePolicy => ({
  id: crypto.randomUUID(),
  code: '',
  name: '',
  enabled: true,
  tracksDays: true,
  grant: 'upfront',
  allowanceDays: null,
  monthlyDays: null,
  cycle: 'year',
  cycleStart: `${johannesburgNow().iso.slice(0, 4)}-01-01`,
  appliesTo: 'Everyone',
  note: '',
  sort
});

function textDays(value: number | null): string {
  return value == null ? '' : String(value);
}

export function LeavePolicyScreen() {
  const { state, dispatch } = useDemo();
  const live = isLiveOrg(state.orgId) && !state.flow;
  const owner = state.viewerRole === 'owner';
  const [rows, setRows] = useState<LeavePolicy[]>(() => state.leavePolicies.length ? state.leavePolicies : starterPolicies());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const today = johannesburgNow().iso;

  const update = (id: string, patch: Partial<LeavePolicy>) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const save = async () => {
    const token = readToken('employer');
    if (!token) {
      setError('Sign in again so this policy can be saved.');
      return;
    }
    const policies = rows.map((row, index) => ({
      ...row,
      code: row.code || leaveCode(row.name),
      sort: index,
      tracksDays: row.grant !== 'none',
      allowanceDays: row.grant === 'none' ? null : row.allowanceDays,
      monthlyDays: row.grant === 'monthly' ? row.monthlyDays : null
    }));
    setSaving(true);
    setError('');
    try {
      const saved = await saveLeavePolicies(token, policies);
      dispatch({ type: 'SET_LEAVE_SETUP', policies: saved, openings: state.leaveOpenings });
      setRows(saved);
      dispatch({ type: 'TOAST', app: 'employer', message: 'Leave policy saved. Employees will see these types.', tone: 'success' });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'The leave policy was not saved.');
    } finally {
      setSaving(false);
    }
  };

  if (!live) {
    return (
      <>
        <MobileHeader title="Leave policy" />
        <ScreenBody>
          <p className="px-1 text-sm leading-relaxed text-muted">The sample company already has leave balances for the guided flows. A signed-in organisation sets its own days here.</p>
        </ScreenBody>
      </>);
  }

  return (
    <>
      <MobileHeader title="Leave policy" subtitle="Your numbers, not a legal calculation" />
      <ScreenBody className="space-y-4">
        <p className="px-1 text-sm leading-relaxed text-muted">
          Switch on the types people may request. Give the full allowance at the start of a cycle, or add a set amount on the last day of each month. For example, 1.25 days each month is 15 days over a year. The balance follows the calendar, so nobody has to press a button at month end.
        </p>
        {rows.map((row) => {
          const preview = row.grant === 'monthly' && row.monthlyDays != null
            ? `${grantSummary(row)}. ${row.allowanceDays == null ? 'There is no yearly ceiling.' : `It stops at ${formatDays(row.allowanceDays)}.`}`
            : grantSummary(row);
          return (
            <section key={row.id} className="space-y-3 rounded-2xl border border-line bg-surface p-4">
              <Field label="Leave type" htmlFor={`name-${row.id}`}>
                <TextInput id={`name-${row.id}`} value={row.name} disabled={!owner} onChange={(event) => update(row.id, { name: event.target.value })} placeholder="Annual leave" />
              </Field>
              <Field label="Employees can request this" htmlFor={`on-${row.id}`}>
                <SelectInput id={`on-${row.id}`} value={row.enabled ? 'yes' : 'no'} disabled={!owner} onChange={(event) => update(row.id, { enabled: event.target.value === 'yes' })} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
              </Field>
              <Field label="How days are added" htmlFor={`grant-${row.id}`} hint={preview}>
                <SelectInput
                  id={`grant-${row.id}`}
                  value={row.grant}
                  disabled={!owner}
                  onChange={(event) => update(row.id, { grant: event.target.value as LeavePolicy['grant'], tracksDays: event.target.value !== 'none' })}
                  options={[
                    { value: 'upfront', label: 'Full allowance at the start of the cycle' },
                    { value: 'monthly', label: 'Add days on the last day of each month' },
                    { value: 'none', label: 'No running balance' }
                  ]} />
              </Field>
              {row.grant === 'upfront' &&
              <Field label="Days in the cycle" htmlFor={`allow-${row.id}`} optional hint="Leave this blank until you have decided the number.">
                <TextInput id={`allow-${row.id}`} inputMode="decimal" value={textDays(row.allowanceDays)} disabled={!owner} onChange={(event) => update(row.id, { allowanceDays: event.target.value.trim() === '' ? null : Number(event.target.value) })} placeholder="15" />
              </Field>}
              {row.grant === 'monthly' &&
              <>
                <Field label="Days added at each month end" htmlFor={`month-${row.id}`} hint="Added only after that month has ended.">
                  <TextInput id={`month-${row.id}`} inputMode="decimal" value={textDays(row.monthlyDays)} disabled={!owner} onChange={(event) => update(row.id, { monthlyDays: event.target.value.trim() === '' ? null : Number(event.target.value) })} placeholder="1.25" />
                </Field>
                <Field label="Stop at this many days in the cycle" htmlFor={`cap-${row.id}`} optional>
                  <TextInput id={`cap-${row.id}`} inputMode="decimal" value={textDays(row.allowanceDays)} disabled={!owner} onChange={(event) => update(row.id, { allowanceDays: event.target.value.trim() === '' ? null : Number(event.target.value) })} placeholder="15" />
                </Field>
              </>}
              {row.grant !== 'none' &&
              <>
                <Field label="Cycle" htmlFor={`cycle-${row.id}`}>
                  <SelectInput id={`cycle-${row.id}`} value={row.cycle === 'event' ? 'year' : row.cycle} disabled={!owner} onChange={(event) => update(row.id, { cycle: event.target.value as LeavePolicy['cycle'] })} options={[{ value: 'year', label: 'Calendar cycle, from the start date' }, { value: 'months36', label: '36 months from the start date' }]} />
                </Field>
                <Field label="Cycle starts" htmlFor={`start-${row.id}`}>
                  <TextInput id={`start-${row.id}`} type="date" value={row.cycleStart} disabled={!owner} onChange={(event) => update(row.id, { cycleStart: event.target.value })} />
                </Field>
              </>}
              <Field label="Who this applies to" htmlFor={`who-${row.id}`}>
                <TextInput id={`who-${row.id}`} value={row.appliesTo} disabled={!owner} onChange={(event) => update(row.id, { appliesTo: event.target.value })} placeholder="Everyone" />
              </Field>
              <Field label="Note employees see" htmlFor={`note-${row.id}`} optional>
                <TextArea id={`note-${row.id}`} value={row.note} disabled={!owner} onChange={(event) => update(row.id, { note: event.target.value })} className="min-h-[64px]" />
              </Field>
              {owner && rows.length > 1 &&
              <Button size="sm" variant="ghost" icon={<Trash2Icon className="h-3.5 w-3.5" />} onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}>Remove this type</Button>}
              <p className="text-xs text-muted">Today is {today}. {row.grant === 'monthly' ? 'A month that has not ended yet is not included.' : 'People who join mid-cycle can be given a starting balance on their profile.'}</p>
            </section>
          );
        })}
        {error && <p role="alert" className="text-sm text-danger-dark">{error}</p>}
        {owner ?
        <div className="space-y-2">
          <Button full variant="secondary" icon={<PlusIcon className="h-4 w-4" />} onClick={() => setRows((current) => [...current, blank(current.length)])}>Add a leave type</Button>
          <Button full loading={saving} onClick={() => { void save(); }}>Save leave policy</Button>
        </div> :
        <p className="text-sm text-muted">Only the owner can change these days.</p>}
      </ScreenBody>
    </>);
}