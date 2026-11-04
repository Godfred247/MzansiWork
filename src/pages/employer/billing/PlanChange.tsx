import { useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { BillingRestricted } from '../../../components/employer/BillingRestricted';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { useDemo } from '../../../contexts/DemoStore';
import { midTermSeatRule } from '../../../data/plans';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import type { Frequency, PlanId } from '../../../types/billing';
import { can } from '../../../utils/permissions';
import { annualSaving, fmtZAR, getPlan, monthlyPrice, planLimit, planRank, priceFor, proration, userRange } from '../../../utils/pricing';
import { seatUsage } from '../../../utils/seats';
import { TODAY, fmtDate } from '../../../utils/time';

export function PlanChange() {
  const { state, dispatch } = useDemo();
  const params = useEmployerParams();
  const planId = (params.planId as PlanId) || state.subscription.planId;
  const freq = ((params.freq as Frequency) || 'monthly') === 'annual' && planId !== 'starter' ? 'annual' : 'monthly';
  const current = state.subscription;
  const [users, setUsers] = useState(Math.max(100, current.enterpriseUsers, seatUsage(state).used));
  const [accepted, setAccepted] = useState(false);

  if (!can(state.viewerRole, 'billing')) {
    return (
      <>
        <MobileHeader title="Confirm change" />
        <ScreenBody><BillingRestricted /></ScreenBody>
      </>);
  }

  const nextPlan = getPlan(planId);
  const usage = seatUsage(state);
  const nextUsers = planId === 'enterprise' ? users : undefined;
  const limit = planLimit(planId, nextUsers ?? 100);
  const blocked = usage.used > limit;
  const samePlan = planId === current.planId && planId !== 'enterprise';
  const frequencyOnly = samePlan && freq !== current.frequency;
  const unchanged = planId === current.planId && freq === current.frequency && planId !== 'enterprise';
  const upgrading = planRank(planId) > planRank(current.planId) || planId === 'enterprise' && current.planId !== 'enterprise';
  const daysLeft = Math.max(0, differenceInCalendarDays(parseISO(current.renewal), parseISO(TODAY)));
  const nowPrice = priceFor(current.planId, current.frequency, current.enterpriseUsers);
  const nextPrice = priceFor(planId, freq, nextUsers ?? current.enterpriseUsers);
  const dueNow = upgrading && freq === 'monthly' ? proration(monthlyPrice(current.planId, current.enterpriseUsers), monthlyPrice(planId, nextUsers), daysLeft) : upgrading && freq === 'annual' ? nextPrice : 0;

  const confirm = () => {
    if (!accepted || blocked || unchanged) return;
    if (frequencyOnly) dispatch({ type: 'SCHEDULE_FREQUENCY', frequency: freq });
    else dispatch({ type: 'CHANGE_PLAN', planId, frequency: freq, users: nextUsers });
    dispatch({ type: 'EMPLOYER_BACK' });
  };

  return (
    <>
      <MobileHeader title={blocked ? 'Plan does not fit' : frequencyOnly ? 'Change billing frequency' : 'Confirm plan change'} />
      <ScreenBody>
        {blocked ?
        <>
            <Banner tone="danger" title="This plan is smaller than your current usage">
              {nextPlan.name} includes {limit} users. You have {usage.active} active members and {usage.reserved} pending invitations ({usage.used} in total). Reduce usage yourself, or pick another plan. Nobody will be deactivated and no invitation will be cancelled for you.
            </Banner>
            <MSection title="What is using seats">
              <MRow title="Active members" subtitle="Includes the owner" trailing={<span className="tnum">{usage.active}</span>} chevron={false} />
              <MRow title="Pending invitations" subtitle="Each reserves one seat" trailing={<span className="tnum">{usage.reserved}</span>} chevron={false} />
              <MRow title={`${nextPlan.name} limit`} trailing={<span className="tnum">{limit}</span>} chevron={false} />
            </MSection>
            <Button full onClick={() => dispatch({ type: 'EMPLOYER_BACK' })}>Choose another plan</Button>
            <Button full variant="secondary" onClick={() => dispatch({ type: 'EMPLOYER_TAB', tab: 'employees' })}>Review employees</Button>
          </> :
        <>
            <Banner tone="warning" title="Nothing changes until you confirm">
              Closing this screen keeps {getPlan(current.planId).name} on {current.frequency} billing at {fmtZAR(nowPrice)}.
            </Banner>
            <MSection title="Change">
              <MRow title="Current" subtitle={`${getPlan(current.planId).name} · ${current.frequency} · ${userRange(getPlan(current.planId))}`} trailing={<span className="tnum text-sm">{fmtZAR(nowPrice)}</span>} chevron={false} />
              <MRow title="New" subtitle={`${nextPlan.name} · ${freq} · ${userRange(nextPlan)}`} trailing={<span className="tnum text-sm">{fmtZAR(nextPrice)}</span>} chevron={false} />
              <MRow title="Effective" subtitle={upgrading ? 'Today, after you confirm' : `On renewal, ${fmtDate(current.renewal, 'd MMM yyyy')}`} chevron={false} />
              <MRow title="Next billing date" subtitle={freq === 'annual' && upgrading ? fmtDate(TODAY, 'd MMM yyyy') + ' + 12 months' : fmtDate(current.renewal, 'd MMM yyyy')} chevron={false} />
              <MRow title="Charge now" subtitle={dueNow > 0 && freq === 'monthly' ? `Prorated for ${daysLeft} days left in this period` : dueNow > 0 ? 'New annual amount, paid upfront' : 'No charge today'} trailing={<span className="tnum text-sm font-semibold">{fmtZAR(dueNow)}</span>} chevron={false} />
            </MSection>
            {planId === 'enterprise' &&
            <MSection title="Agreed user count" footer="Monthly price is the greater of R270 or R2.70 × users. Illustrative only.">
                <div className="flex items-center gap-3 p-4">
                  <Button variant="secondary" size="sm" aria-label="Fewer users" onClick={() => setUsers((n) => Math.max(100, usage.used, n - 10))} icon={<MinusIcon className="h-4 w-4" />} />
                  <span className="tnum text-2xl font-semibold text-ink">{users}</span>
                  <Button variant="secondary" size="sm" aria-label="More users" onClick={() => setUsers((n) => n + 10)} icon={<PlusIcon className="h-4 w-4" />} />
                </div>
              </MSection>
            }
            {freq === 'annual' && planId !== 'starter' &&
            <p className="px-1 text-xs text-success">You save {fmtZAR(annualSaving(planId, nextUsers))} (10%) compared with twelve monthly payments of {fmtZAR(monthlyPrice(planId, nextUsers))}.</p>
            }
            <p className="px-1 text-xs leading-relaxed text-muted">{midTermSeatRule}</p>
            <label className="flex items-start gap-3 rounded-2xl bg-surface p-4 text-sm text-ink shadow-card">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              <span>I confirm this {frequencyOnly ? 'billing frequency' : 'plan'} change, the price of {fmtZAR(nextPrice)}, and the effective date above. This is a simulated confirmation — no card is charged.</span>
            </label>
            <Button full disabled={!accepted || unchanged} onClick={confirm}>{unchanged ? 'Already on this plan' : 'Confirm change'}</Button>
            <Button full variant="ghost" onClick={() => dispatch({ type: 'EMPLOYER_BACK' })}>Cancel</Button>
          </>
        }
      </ScreenBody>
    </>);
}
