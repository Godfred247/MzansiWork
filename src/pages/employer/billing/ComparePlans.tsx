import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { BillingRestricted } from '../../../components/employer/BillingRestricted';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Button } from '../../../components/shared/Button';
import { Segmented } from '../../../components/shared/Segmented';
import { useDemo } from '../../../contexts/DemoStore';
import { PRICING_NOTE, coreFeatures, plans } from '../../../data/plans';
import type { Frequency, PlanId } from '../../../types/billing';
import { can } from '../../../utils/permissions';
import { annualSaving, fmtZAR, monthlyPrice, priceFor, userRange } from '../../../utils/pricing';
import { seatUsage } from '../../../utils/seats';

export function ComparePlans() {
  const { state, dispatch } = useDemo();
  const [freq, setFreq] = useState<Frequency>(state.subscription.frequency);
  const usage = seatUsage(state);

  if (!can(state.viewerRole, 'billing')) {
    return (
      <>
        <MobileHeader title="Compare plans" />
        <ScreenBody><BillingRestricted /></ScreenBody>
      </>);
  }

  const fits = (id: PlanId) => {
    const plan = plans.find((p) => p.id === id)!;
    return usage.used <= (plan.maxUsers ?? Infinity);
  };

  return (
    <>
      <MobileHeader title="Compare plans" subtitle={`${usage.used} seats in use or reserved`} />
      <ScreenBody>
        <Segmented full label="Billing frequency" value={freq} onChange={setFreq} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual · 10% off' }]} />
        <p className="-mt-3 px-1 text-xs text-muted">Annual billing is available from 6 users. Starter stays monthly. Pay annually and save 10% compared with monthly billing.</p>
        <ul className="rounded-2xl bg-surface p-4 text-[13px] text-ink shadow-card">
          <li className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Included on every paid plan</li>
          {coreFeatures.map((f) => <li key={f} className="py-1">{f}</li>)}
        </ul>
        <fieldset className="space-y-2">
          <legend className="sr-only">Plans</legend>
          {plans.map((plan) => {
            const current = plan.id === state.subscription.planId && (plan.id === 'starter' ? true : freq === state.subscription.frequency);
            const billing: Frequency = plan.id === 'starter' ? 'monthly' : freq;
            const users = plan.id === 'enterprise' ? Math.max(100, state.subscription.enterpriseUsers) : undefined;
            const ok = fits(plan.id) || plan.id === 'enterprise';
            return (
              <div key={plan.id} className={twMerge('rounded-2xl border bg-surface p-4', current ? 'border-primary' : 'border-line', !ok && 'opacity-70')}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[15px] font-semibold text-ink">{plan.name}{current ? ' · current' : ''}</p>
                  <p className="tnum text-[15px] font-semibold text-ink">{fmtZAR(priceFor(plan.id, billing, users))}<span className="text-xs font-normal text-muted">/{billing === 'annual' ? 'yr' : 'mo'}</span></p>
                </div>
                <p className="mt-0.5 text-xs text-muted">{userRange(plan)}{plan.id === 'starter' ? ' · monthly only' : ''}</p>
                <p className="mt-1 text-xs text-muted">{plan.blurb}</p>
                {billing === 'annual' && <p className="tnum mt-1 text-xs font-medium text-success">Save {fmtZAR(annualSaving(plan.id, users))} compared with {fmtZAR(monthlyPrice(plan.id, users) * 12)}</p>}
                {!ok && <p className="mt-1 text-xs text-danger-dark">Too small for {usage.used} active members and pending invitations.</p>}
                <Button
                  full
                  size="sm"
                  className="mt-3"
                  variant={current ? 'secondary' : 'primary'}
                  disabled={!ok && plan.id !== state.subscription.planId}
                  onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'plan-change', params: { planId: plan.id, freq: billing } } })}>
                  {current ? 'Review this plan' : 'Review this change'}
                </Button>
              </div>);
          })}
        </fieldset>
        <p className="px-1 text-xs text-muted">{PRICING_NOTE} Prices are in South African rand. Choosing a plan here does not charge you — the next screen asks for confirmation.</p>
      </ScreenBody>
    </>);
}
