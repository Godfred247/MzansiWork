import { useState } from 'react';
import { BillingRestricted } from '../../../components/employer/BillingRestricted';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { TextInput } from '../../../components/shared/TextInput';
import { useDemo } from '../../../contexts/DemoStore';
import { GRACE_DAYS } from '../../../data/plans';
import { can } from '../../../utils/permissions';
import { fmtZAR, getPlan, priceFor } from '../../../utils/pricing';
import { fmtDate } from '../../../utils/time';

export function FailedPayment() {
  const { state, dispatch } = useDemo();
  const [card, setCard] = useState('4242');
  const [error, setError] = useState('');
  const sub = state.subscription;

  if (!can(state.viewerRole, 'billing')) {
    return (
      <>
        <MobileHeader title="Payment" />
        <ScreenBody><BillingRestricted /></ScreenBody>
      </>);
  }

  const amount = sub.amountDue ?? priceFor(sub.planId, sub.frequency, sub.enterpriseUsers);

  const updateCard = () => {
    if (!/^\d{4}$/.test(card)) {
      setError('Enter the last 4 digits so we can label the new card.');
      return;
    }
    dispatch({ type: 'UPDATE_PAYMENT_METHOD', label: `Visa •••• ${card}` });
  };

  if (sub.payment === 'paid') {
    return (
      <>
        <MobileHeader title="Payment" />
        <ScreenBody>
          <Banner tone="success" title="No outstanding payment">{sub.paymentMethod} is up to date. {getPlan(sub.planId).name} renews on {fmtDate(sub.renewal, 'd MMM yyyy')}.</Banner>
          <MSection title="Demo only" footer="This control is simulated. It does not contact a bank.">
            <div className="p-4">
              <Button full variant="secondary" onClick={() => dispatch({ type: 'PAYMENT_FAIL' })}>Simulate a failed renewal</Button>
            </div>
          </MSection>
        </ScreenBody>
      </>);
  }

  return (
    <>
      <MobileHeader title="Payment failed" />
      <ScreenBody>
        <Banner tone="danger" title={`${fmtZAR(amount)} could not be collected`}>
          Failed on {sub.failedOn ? fmtDate(sub.failedOn, 'd MMM yyyy') : 'the renewal date'} using {sub.paymentMethod}. We will not charge a different amount or switch you to another billing frequency.
        </Banner>
        <MSection title="Grace period" footer="Proposed commercial term. Confirm it in the customer agreement before launch.">
          <MRow title={`${GRACE_DAYS} days to resolve`} subtitle="Invitations stay open during the grace period. If payment is still unsuccessful afterwards, new invitations stop and the subscription is marked inactive. Records remain available to export." chevron={false} />
        </MSection>
        <MSection title="Update payment method">
          <div className="space-y-3 p-4">
            <Field label="New card, last 4 digits" htmlFor="card" error={error} hint="Demo only — no card number is stored or sent.">
              <TextInput id="card" inputMode="numeric" maxLength={4} value={card} onChange={(e) => {setCard(e.target.value);setError('');}} />
            </Field>
            <Button full variant="secondary" onClick={updateCard}>Save payment method</Button>
          </div>
        </MSection>
        <Button full onClick={() => dispatch({ type: 'RETRY_PAYMENT', ok: true })}>Retry payment</Button>
        <Button full variant="ghost" onClick={() => dispatch({ type: 'RETRY_PAYMENT', ok: false })}>Simulate another decline</Button>
      </ScreenBody>
    </>);
}
