import { useState } from 'react';
import { BillingRestricted } from '../../../components/employer/BillingRestricted';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { useDemo } from '../../../contexts/DemoStore';
import { can } from '../../../utils/permissions';
import { fmtZAR, getPlan, priceFor } from '../../../utils/pricing';
import { fmtDate } from '../../../utils/time';

export function Cancellation() {
  const { state, dispatch } = useDemo();
  const [accepted, setAccepted] = useState(false);
  const sub = state.subscription;

  if (!can(state.viewerRole, 'billing')) {
    return (
      <>
        <MobileHeader title="Cancel subscription" />
        <ScreenBody><BillingRestricted /></ScreenBody>
      </>);
  }

  const plan = getPlan(sub.planId);
  const price = priceFor(sub.planId, sub.frequency, sub.enterpriseUsers);

  if (sub.cancelEffective) {
    return (
      <>
        <MobileHeader title="Cancellation" />
        <ScreenBody>
          <Banner tone="warning" title="Your subscription will end">{fmtDate(sub.cancelEffective, 'd MMMM yyyy')}. You can keep using MzansiWork until then, and you can resume renewal at any time before that date.</Banner>
          <Button full onClick={() => dispatch({ type: 'RESUME_SUBSCRIPTION' })}>Resume subscription</Button>
        </ScreenBody>
      </>);
  }

  return (
    <>
      <MobileHeader title="Cancel subscription" />
      <ScreenBody>
        <MSection title={plan.name}>
          <MRow title={sub.frequency === 'annual' ? 'Annual price' : 'Monthly price'} trailing={<span className="tnum">{fmtZAR(price)}</span>} chevron={false} />
          <MRow title="Access continues until" subtitle="The end of the period you have already paid for" trailing={<span className="text-sm">{fmtDate(sub.renewal, 'd MMM yyyy')}</span>} chevron={false} />
          <MRow title="After that date" subtitle="The subscription does not renew. Export attendance, leave and timesheets before then if you need a copy." chevron={false} />
        </MSection>
        <MSection title="Before you cancel" footer="This prototype does not calculate a refund. Production terms must state any refund or notice period in plain language.">
          <div className="space-y-3 p-4">
            <Button full variant="secondary" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'exports' } })}>Export organisation data</Button>
            <label className="flex items-start gap-3 text-sm text-ink">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              <span>I understand access continues until {fmtDate(sub.renewal, 'd MMMM yyyy')} and {plan.name} will not renew. This confirmation is simulated.</span>
            </label>
          </div>
        </MSection>
        <Button full variant="danger" disabled={!accepted} onClick={() => dispatch({ type: 'CANCEL_SUBSCRIPTION' })}>Confirm cancellation</Button>
        <Button full variant="ghost" onClick={() => dispatch({ type: 'EMPLOYER_BACK' })}>Keep my subscription</Button>
      </ScreenBody>
    </>);
}
