import { BillingRestricted } from '../../../components/employer/BillingRestricted';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { SeatMeter } from '../../../components/shared/SeatMeter';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../contexts/DemoStore';
import { GRACE_DAYS, PRICING_NOTE } from '../../../data/plans';
import { can } from '../../../utils/permissions';
import { fmtZAR, getPlan, priceFor } from '../../../utils/pricing';
import { seatUsage } from '../../../utils/seats';
import { fmtDate } from '../../../utils/time';

export function Subscription() {
  const { state, dispatch } = useDemo();
  if (!can(state.viewerRole, 'billing')) {
    return (
      <>
        <MobileHeader title="Subscription" />
        <ScreenBody><BillingRestricted /></ScreenBody>
      </>);
  }

  const sub = state.subscription;
  const plan = getPlan(sub.planId);
  const price = priceFor(sub.planId, sub.frequency, sub.enterpriseUsers);
  const usage = seatUsage(state);

  return (
    <>
      <MobileHeader title="Subscription" subtitle="Paid plans only — no free tier" />
      <ScreenBody>
        {sub.payment === 'failed' &&
        <Banner tone="danger" title="Payment failed" action={<Button size="sm" variant="danger" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'failed-payment' } })}>Review payment</Button>}>
            {fmtZAR(sub.amountDue ?? price)} is due. You have {GRACE_DAYS} days to update the card before invitations are paused.
          </Banner>
        }
        {sub.cancelEffective &&
        <Banner tone="warning" title="Cancellation scheduled" action={<Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'RESUME_SUBSCRIPTION' })}>Keep subscription</Button>}>
            Access continues until {fmtDate(sub.cancelEffective, 'd MMMM yyyy')}. It will not renew after that.
          </Banner>
        }
        {(sub.scheduledPlanId || sub.scheduledFrequency) &&
        <Banner tone="info" title="A change is scheduled" action={<Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'CANCEL_SCHEDULED' })}>Cancel scheduled change</Button>}>
            {sub.scheduledPlanId ? getPlan(sub.scheduledPlanId).name : plan.name} · {sub.scheduledFrequency ?? sub.frequency} from {fmtDate(sub.scheduledEffective ?? sub.renewal, 'd MMM yyyy')}. Nothing else changes until that date.
          </Banner>
        }
        <MSection title="Current plan" footer={PRICING_NOTE}>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-ink">{plan.name}</p>
                <p className="text-xs text-muted">{sub.frequency === 'annual' ? 'Annual billing' : 'Monthly billing'} · renews {fmtDate(sub.renewal, 'd MMM yyyy')}</p>
              </div>
              <p className="tnum text-lg font-semibold text-ink">{fmtZAR(price)}<span className="text-xs font-normal text-muted">/{sub.frequency === 'annual' ? 'yr' : 'mo'}</span></p>
            </div>
            <div className="mt-3"><SeatMeter usage={usage} /></div>
          </div>
          <MRow title="Payment status" subtitle={sub.paymentMethod} trailing={<StatusBadge tone={sub.payment === 'paid' ? 'success' : 'danger'} label={sub.payment === 'paid' ? 'Paid' : 'Failed'} />} onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'failed-payment' } })} />
          <MRow title="Included users" subtitle="Owner counts as one. Pending invitations reserve a seat." trailing={<span className="tnum text-sm font-semibold">{usage.limit}</span>} chevron={false} />
        </MSection>
        <div className="space-y-2">
          <Button full onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'compare' } })}>Compare plans</Button>
          {plan.id !== 'starter' &&
          <Button full variant="secondary" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'plan-change', params: { planId: plan.id, freq: sub.frequency === 'annual' ? 'monthly' : 'annual' } } })}>
              {sub.frequency === 'annual' ? 'Review a switch to monthly' : 'Review annual billing · save 10%'}
            </Button>
          }
          <Button full variant="ghost" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'cancel' } })}>Cancel subscription</Button>
        </div>
        <p className="px-1 text-xs leading-relaxed text-muted">MzansiWork will not upgrade your plan, change monthly to annual, or charge a new price unless you confirm it on the next screen.</p>
      </ScreenBody>
    </>);
}
