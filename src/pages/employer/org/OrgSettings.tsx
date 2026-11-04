import { useState } from 'react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { AccessDenied } from '../../../components/shared/AccessDenied';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { SelectInput } from '../../../components/shared/SelectInput';
import { TextInput } from '../../../components/shared/TextInput';
import { useDemo } from '../../../contexts/DemoStore';
import { can, viewerRoleLabel } from '../../../utils/permissions';

export function OrgSettings() {
  const { state, dispatch } = useDemo();
  const [name, setName] = useState(state.org.name);
  const [contact, setContact] = useState(state.org.contact);
  const [week, setWeek] = useState(state.org.week);
  const [hours, setHours] = useState(state.org.hours);
  const [error, setError] = useState('');

  if (!can(state.viewerRole, 'manage_policy')) {
    return (
      <>
        <MobileHeader title="Organisation" />
        <ScreenBody>
          <AccessDenied
            title="Organisation settings are owner-only"
            body="Managers can work with people and approvals. Changing the organisation profile, week and default hours is limited to the owner."
            attempted="PATCH /api/organisations/karoo"
            role={viewerRoleLabel(state.viewerRole)} />
        </ScreenBody>
      </>);
  }

  const save = () => {
    if (name.trim().length < 2) {
      setError('Enter the organisation name.');
      return;
    }
    dispatch({
      type: 'AUDIT_LOG',
      category: 'policy',
      action: 'Updated organisation settings',
      target: `${name.trim()} · ${week} · ${hours}`,
      toast: 'Organisation settings saved'
    });
  };

  return (
    <>
      <MobileHeader title="Organisation" subtitle={state.org.timezone} />
      <ScreenBody>
        <MSection title="Profile" footer="Branches are optional. Historical attendance is kept if you rename a branch later.">
          <div className="space-y-3 p-4">
            <Field label="Organisation name" htmlFor="org-name" error={error}>
              <TextInput id="org-name" value={name} onChange={(e) => {setName(e.target.value);setError('');}} />
            </Field>
            <Field label="Business contact" htmlFor="org-contact" hint="Shown on employee invitations and support replies.">
              <TextInput id="org-contact" value={contact} onChange={(e) => setContact(e.target.value)} />
            </Field>
            <Field label="Time zone" htmlFor="org-tz" hint="Default for new organisations is Africa/Johannesburg. Times are stored in UTC and shown in this zone.">
              <TextInput id="org-tz" value={state.org.timezone} disabled />
            </Field>
          </div>
        </MSection>
        <MSection title="Working week" footer="Individual employees can have a different schedule. Overnight shifts are supported on the employee record.">
          <div className="space-y-3 p-4">
            <Field label="Preferred working week" htmlFor="org-week">
              <SelectInput id="org-week" value={week} onChange={(e) => setWeek(e.target.value)} options={['Monday – Friday', 'Monday – Saturday', 'Sunday – Thursday'].map((w) => ({ value: w, label: w }))} />
            </Field>
            <Field label="Standard hours" htmlFor="org-hours" hint="Used as the default schedule. Overtime figures stay estimates until payroll policy is confirmed.">
              <TextInput id="org-hours" value={hours} onChange={(e) => setHours(e.target.value)} />
            </Field>
          </div>
        </MSection>
        <MSection title="Branches">
          <div className="px-4 py-3 text-sm text-ink">{state.org.branches.join(' · ')}</div>
        </MSection>
        <Button full onClick={save}>Save settings</Button>
      </ScreenBody>
    </>);
}
