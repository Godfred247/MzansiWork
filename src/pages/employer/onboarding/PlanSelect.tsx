import { useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { StepProgress } from '../../../components/employer/StepProgress';
import { Button } from '../../../components/shared/Button';
import { Segmented } from '../../../components/shared/Segmented';
import { updateSignupDraft } from '../../../api/signupDraft';
import { useDemo } from '../../../contexts/DemoStore';
import { PRICING_NOTE, plans } from '../../../data/plans';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import type { Frequency, PlanId } from '../../../types/billing';
import { annualSaving, fmtZAR, monthlyPrice, priceFor, userRange } from '../../../utils/pricing';

function recommend(users: number): PlanId {
  if (users <= 5) return 'starter';
  if (users <= 19) return 'small';
  if (users <= 39) return 'medium';
  if (users <= 99) return 'large';
  return 'enterprise';
}

export function PlanSelect() {
  const { dispatch } = useDemo();
  const p = useEmployerParams();
  const [users, setUsers] = useState(8);
  const [freq, setFreq] = useState<Frequency>('monthly');
  const [plan, setPlan] = useState<PlanId>(recommend(8));
  const fits = (id: PlanId) => {
    const pl = plans.find((x) => x.id === id)!;
    return users <= (pl.maxUsers ?? Infinity);
  };
  const eff: Frequency = plan === 'starter' ? 'monthly' : freq;

  return (
    <>
      <MobileHeader title="Choose a plan" />
      <StepProgress step={3} total={4} label="Subscription" />
      <ScreenBody className="pt-3">
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <p className="text-[13px] font-medium text-ink">How many people will use MzansiWork?</p>
          <p className="text-xs text-muted">Include yourself — the owner counts as one user.</p>
          <div className="mt-3 flex items-center gap-3">
            <Button variant="secondary" size="sm" aria-label="Fewer users" onClick={() => {const n = Math.max(1, users - 1);setUsers(n);setPlan(recommend(n));}} icon={<MinusIcon className="h-4 w-4" />} />
            <span className="tnum w-12 text-center text-2xl font-semibold text-ink" aria-live="polite">{users}</span>
            <Button variant="secondary" size="sm" aria-label="More users" onClick={() => {const n = users + 1;setUsers(n);setPlan(recommend(n));}} icon={<PlusIcon className="h-4 w-4" />} />
          </div>
        </div>

        <Segmented full label="Billing frequency" value={freq} onChange={setFreq} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual · save 10%' }]} />
        {freq === 'annual' && <p className="-mt-3 px-1 text-xs text-muted">Annual billing is for plans with 6+ users. You pay for 12 months upfront at 10% less than 12 monthly payments.</p>}

        <fieldset className="space-y-2">
          <legend className="sr-only">Plans</legend>
          {plans.filter((x) => x.id !== 'enterprise' || users >= 100).map((pl) => {
            const ok = fits(pl.id);
            const f: Frequency = pl.id === 'starter' ? 'monthly' : freq;
            return (
              <label key={pl.id} className={twMerge('flex cursor-pointer items-start gap-3 rounded-2xl border bg-surface p-4', plan === pl.id ? 'border-primary ring-1 ring-primary' : 'border-line', !ok && 'cursor-not-allowed opacity-50')}>
                <input type="radio" name="plan" disabled={!ok} checked={plan === pl.id} onChange={() => setPlan(pl.id)} className="mt-1 h-4 w-4 accent-primary" />
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[15px] font-semibold text-ink">{pl.name}</span>
                    <span className="tnum text-[15px] font-semibold text-ink">{fmtZAR(priceFor(pl.id, f, Math.max(users, 100)))}<span className="text-xs font-normal text-muted">/{f === 'annual' ? 'yr' : 'mo'}</span></span>
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">{userRange(pl)}{pl.id === 'starter' ? ' · monthly only' : ''}</span>
                  {f === 'annual' && <span className="tnum mt-1 block text-xs font-medium text-success">Save {fmtZAR(annualSaving(pl.id))} vs {fmtZAR(monthlyPrice(pl.id) * 12)} monthly</span>}
                  {!ok && <span className="mt-1 block text-xs text-danger-dark">Too small for {users} users</span>}
                </span>
              </label>);

          })}
        </fieldset>
        <p className="px-1 text-xs text-muted">No free plan. {PRICING_NOTE} Prices in ZAR.</p>
        <Button full size="lg" onClick={() => {updateSignupDraft({ planId: plan, frequency: eff, users });dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'invite-first', params: { ...p, planId: plan, freq: eff, users: String(users) } } });}}>
          Continue with {plans.find((x) => x.id === plan)?.name}
        </Button>
      </ScreenBody>
    </>);

}