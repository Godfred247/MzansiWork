import { useState } from 'react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { AccessDenied } from '../../../components/shared/AccessDenied';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { TextInput } from '../../../components/shared/TextInput';
import { Toggle } from '../../../components/shared/Toggle';
import { useDemo } from '../../../contexts/DemoStore';
import { collected, notCollected, trackingPolicy } from '../../../data/policy';
import { can, viewerRoleLabel } from '../../../utils/permissions';

export function TrackingPolicyAdmin() {
  const { state, dispatch } = useDemo();
  const [idle, setIdle] = useState(String(trackingPolicy.idleThresholdMin));
  const [explain, setExplain] = useState(String(trackingPolicy.explanationOverMin));
  const [pause, setPause] = useState(trackingPolicy.pauseAllowed);
  const [error, setError] = useState('');

  if (!can(state.viewerRole, 'manage_policy')) {
    return (
      <>
        <MobileHeader title="Tracking policy" />
        <ScreenBody>
          <AccessDenied
            title="Only the owner can change tracking policy"
            body="Employees can read the policy. Managers can see observations they are allowed to review. Changing what is collected requires the owner."
            attempted="PATCH /api/organisations/mzansiwork/tracking-policy"
            role={viewerRoleLabel(state.viewerRole)} />
        </ScreenBody>
      </>);
  }

  const save = () => {
    const minutes = Number(idle);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 60) {
      setError('Set an idle threshold between 1 and 60 minutes.');
      return;
    }
    dispatch({
      type: 'AUDIT_LOG',
      category: 'policy',
      action: 'Updated tracking policy',
      target: `Idle threshold ${minutes} min · pause ${pause ? 'allowed' : 'not allowed'}`,
      reason: 'Owner saved a new draft. Employees should be notified before it applies.',
      toast: 'Policy draft saved. Employees are notified when it is published.'
    });
  };

  return (
    <>
      <MobileHeader title="Tracking policy" subtitle={trackingPolicy.version} />
      <ScreenBody>
        <Banner tone="warning" title="Idle time is an observation">
          Reaching the threshold records that the operating system reported no input. It does not prove the employee was not working, and it is not deducted automatically.
        </Banner>
        <MSection title="Thresholds" footer={`Published policy: ${trackingPolicy.name}. Retention: ${trackingPolicy.retention}.`}>
          <div className="space-y-3 p-4">
            <Field label="Idle threshold (minutes)" htmlFor="idle" error={error} hint="Example default is 5 minutes. The agent shows this as employer-managed and read-only.">
              <TextInput id="idle" inputMode="numeric" value={idle} onChange={(e) => {setIdle(e.target.value);setError('');}} />
            </Field>
            <Field label="Ask for an explanation after (minutes)" htmlFor="explain" hint="Shorter gaps can stay unclassified without blocking clock-out.">
              <TextInput id="explain" inputMode="numeric" value={explain} onChange={(e) => setExplain(e.target.value)} />
            </Field>
            <Toggle checked={pause} onChange={setPause} label="Employees may pause the desktop agent" description="Pausing must stop tracking. The agent must not keep monitoring in secret." />
          </div>
        </MSection>
        <MSection title="What is collected">
          {collected.map((c) => <MRow key={c.item} title={c.item} subtitle={c.when} trailing={<span className="text-[11px] text-muted">{c.visible ? 'Visible to employee' : 'Operational only'}</span>} chevron={false} />)}
        </MSection>
        <MSection title="Never collected">
          {notCollected.map((item) => <MRow key={item} title={item} chevron={false} />)}
        </MSection>
        <MSection title="Other rules">
          <MRow title="Timesheet deadline" subtitle={trackingPolicy.submissionDeadline} chevron={false} />
          <MRow title="Rounding" subtitle={trackingPolicy.rounding} chevron={false} />
          <MRow title="Overtime warning" subtitle={trackingPolicy.overtimeWarning} chevron={false} />
          <MRow title="Approver" subtitle={trackingPolicy.approver} chevron={false} />
        </MSection>
        <Button full onClick={save}>Save policy draft</Button>
      </ScreenBody>
    </>);
}
