import { useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { StepProgress } from '../../../components/employer/StepProgress';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { SelectInput } from '../../../components/shared/SelectInput';
import { TextInput } from '../../../components/shared/TextInput';
import { updateSignupDraft } from '../../../api/signupDraft';
import { useDemo } from '../../../contexts/DemoStore';
import { useEmployerParams } from '../../../hooks/useEmployerParams';

const standardHours = [
  { value: '06:00 – 15:00', label: '06:00–15:00 · early site' },
  { value: '07:00 – 16:00', label: '07:00–16:00 · site or warehouse' },
  { value: '07:30 – 16:00', label: '07:30–16:00 · public service' },
  { value: '07:30 – 16:30', label: '07:30–16:30' },
  { value: '08:00 – 16:30', label: '08:00–16:30' },
  { value: '08:00 – 17:00', label: '08:00–17:00 · office' },
  { value: '08:30 – 17:00', label: '08:30–17:00' },
  { value: '09:00 – 17:00', label: '09:00–17:00' },
  { value: '09:00 – 18:00', label: '09:00–18:00 · retail' },
  { value: '10:00 – 19:00', label: '10:00–19:00 · late retail' },
  { value: '12:00 – 21:00', label: '12:00–21:00 · afternoon shift' },
  { value: '14:00 – 22:00', label: '14:00–22:00 · evening shift' },
  { value: '22:00 – 06:00', label: '22:00–06:00 · night shift' }
];

export function OrgDetails() {
  const { dispatch } = useDemo();
  const p = useEmployerParams();
  const [org, setOrg] = useState(p.orgName ?? '');
  const [contact, setContact] = useState('');
  const [timezone, setTimezone] = useState('Africa/Johannesburg');
  const [week, setWeek] = useState('Monday – Friday');
  const [hours, setHours] = useState('08:00 – 17:00');
  const [branches, setBranches] = useState<string[]>([]);
  const [branch, setBranch] = useState('');
  const [tried, setTried] = useState(false);
  const nameError = tried && org.trim().length < 2 ? 'Enter your organisation name.' : '';
  const emailError = tried && !/^\S+@\S+\.\S{2,}$/.test(contact.trim()) ? 'Enter a business contact email.' : '';

  return (
    <>
      <MobileHeader title="Organisation" />
      <StepProgress step={2} total={4} label="Organisation details" />
      <ScreenBody className="bg-surface pt-3">
        <p className="text-sm text-muted">The organisation name and business contact email are required. You can change the rest later in Settings.</p>
        <Field label="Organisation name" htmlFor="od-name" error={nameError}><TextInput id="od-name" value={org} invalid={!!nameError} onChange={(e) => setOrg(e.target.value)} /></Field>
        <Field label="Business contact email" htmlFor="od-email" error={emailError} hint="Used for invoices, invitations, and product updates."><TextInput id="od-email" type="email" value={contact} invalid={!!emailError} onChange={(e) => setContact(e.target.value)} placeholder="hello@company.co.za" autoComplete="email" /></Field>
        <Field label="Time zone" htmlFor="od-tz"><SelectInput id="od-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} options={[{ value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST, UTC+2)' }]} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Working week" htmlFor="od-week"><SelectInput id="od-week" value={week} onChange={(e) => setWeek(e.target.value)} options={[{ value: 'Monday – Friday', label: 'Mon–Fri' }, { value: 'Monday – Saturday', label: 'Mon–Sat' }]} /></Field>
          <Field label="Standard hours" htmlFor="od-hours"><SelectInput id="od-hours" value={hours} onChange={(e) => setHours(e.target.value)} options={standardHours} /></Field>
        </div>
        <Field label="Branches or departments" htmlFor="od-branch" optional hint="Helps managers filter attendance.">
          <div className="flex gap-2">
            <TextInput id="od-branch" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. Durban" />
            <Button variant="secondary" icon={<PlusIcon className="h-4 w-4" />} aria-label="Add branch" onClick={() => {
              const next = branch.trim();
              if (!next || branches.some((item) => item.toLowerCase() === next.toLowerCase())) return;
              setBranches([...branches, next]);
              setBranch('');
            }} />
          </div>
        </Field>
        <div className="flex flex-wrap gap-1.5">
          {branches.map((b) =>
          <span key={b} className="flex items-center gap-1 rounded-full bg-hover px-2.5 py-1 text-xs text-ink">
              {b}
              <button aria-label={`Remove ${b}`} onClick={() => setBranches(branches.filter((x) => x !== b))}><XIcon className="h-3 w-3" /></button>
            </span>
          )}
        </div>
        <Field label="Default tracking policy" htmlFor="od-policy" hint="Idle threshold and categories are configurable later. Employees always see the policy.">
          <SelectInput id="od-policy" defaultValue="standard" options={[{ value: 'standard', label: 'Standard — portal + optional agent (5-min idle)' }, { value: 'portal', label: 'Portal only — no desktop agent' }]} />
        </Field>
        <Button full size="lg" onClick={() => {
          setTried(true);
          if (org.trim().length < 2 || !/^\S+@\S+\.\S{2,}$/.test(contact.trim())) return;
          updateSignupDraft({ organisationName: org.trim(), contact: contact.trim(), timezone, workingWeek: week, standardHours: hours, branches });
          dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'plan', params: { ...p, orgName: org.trim() } } });
        }}>Continue</Button>
      </ScreenBody>
    </>);

}