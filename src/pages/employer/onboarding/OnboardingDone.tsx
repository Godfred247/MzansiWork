import { useState } from 'react';
import { CheckCircle2Icon, MonitorIcon, ShieldCheckIcon } from 'lucide-react';
import { api, ApiError, openWorkspace, saveToken } from '../../../api/client';
import { clearSignupDraft, signupDraft } from '../../../api/signupDraft';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { RowIcon } from '../../../components/employer/RowIcon';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../contexts/DemoStore';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import type { Frequency, PlanId } from '../../../types/billing';
import { fmtZAR, getPlan, planLimit, priceFor } from '../../../utils/pricing';

export function OnboardingDone() {
  const { dispatch } = useDemo();
  const p = useEmployerParams();
  const draft = signupDraft();
  const planId = (p.planId ?? draft.planId ?? 'small') as PlanId;
  const freq = (p.freq ?? draft.frequency ?? 'monthly') as Frequency;
  const invites = draft.invites.filter((invite) => invite.email);
  const limit = planLimit(planId, Number(p.users) || draft.users);
  const used = 1 + invites.length;
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!draft.email || !draft.password) {
      setError('The account details were lost. Go back and enter them again.');
      return;
    }
    if (!confirm) {
      setError('Confirm the paid plan before the organisation is created.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await api<{ token: string }>('/api/auth/register', {
        body: {
          fullName: draft.fullName,
          email: draft.email,
          password: draft.password,
          organisationName: draft.organisationName || p.orgName,
          planId,
          frequency: freq,
          users: Number(p.users) || draft.users,
          confirm: true,
          timezone: draft.timezone,
          contact: draft.contact,
          workingWeek: draft.workingWeek,
          standardHours: draft.standardHours,
          invites: invites.map((invite) => ({ email: invite.email, role: invite.role, department: invite.department, branch: invite.branch }))
        }
      });
      saveToken('employer', created.token);
      const workspace = await openWorkspace(created.token);
      clearSignupDraft();
      dispatch({ type: 'ENTER_WORKSPACE', app: 'employer', workspace });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'The organisation could not be created.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-8 pt-8">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success"><CheckCircle2Icon className="h-7 w-7" aria-hidden /></span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">{p.orgName || 'Your organisation'} is ready</h1>
        <p className="mt-1 text-sm text-muted">Confirm the paid plan to save {p.orgName || draft.organisationName || 'your organisation'} in Supabase. No card is charged.</p>
      </div>
      <div className="mt-6 space-y-5">
        <MSection title="Subscription">
          <MRow title={getPlan(planId).name} subtitle={`${freq === 'annual' ? 'Annual' : 'Monthly'} · renews automatically, cancel any time`} trailing={<span className="tnum text-sm font-semibold text-ink">{fmtZAR(priceFor(planId, freq))}</span>} />
          <MRow title="Seats" subtitle="You + pending invitations" trailing={<span className="tnum text-sm text-ink">{used} used · {limit - used} available</span>} />
        </MSection>
        {invites.length > 0 &&
        <MSection title="Invitations" footer="Each invitation is saved and reserves a seat. Email delivery stays queued until SendGrid is configured.">
            {invites.map((invite) => <MRow key={invite.email} title={invite.email} subtitle={invite.role} trailing={<StatusBadge tone="warning" label="Pending" />} />)}
          </MSection>
        }
        <MSection title="Recommended next">
          <MRow leading={<RowIcon icon={ShieldCheckIcon} tone="teal" />} title="Review your tracking policy" subtitle="Employees see exactly what’s collected" />
          <MRow leading={<RowIcon icon={MonitorIcon} tone="navy" />} title="Optional: share the Windows agent" subtitle="For idle/active observations during work sessions" />
        </MSection>
        <label className="flex items-start gap-2.5 text-[13px] text-ink">
          <input type="checkbox" checked={confirm} onChange={(e) => {setConfirm(e.target.checked);setError('');}} className="mt-0.5 h-4 w-4 accent-primary" />
          I confirm this paid plan. The organisation, owner, and invitations will be saved.
        </label>
        {error && <Banner tone="danger" title="Organisation not created">{error}</Banner>}
        <Button full size="lg" loading={loading} onClick={create}>Create organisation</Button>
      </div>
    </div>);

}