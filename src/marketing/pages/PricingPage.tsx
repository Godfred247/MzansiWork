import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, MailIcon, ShieldCheckIcon, UserRoundIcon, UsersIcon, type LucideIcon } from 'lucide-react';
import { plans } from '../../data/plans';
import { ANNUAL_DISCOUNT } from '../../data/plans';
import { rand } from '../format';
import { ButtonLink, CtaBand, FaqList, Kicker, Section } from '../components/Ui';

function SeatBoard() {
  const seats = Array.from({ length: 19 }, (_, index) => index < 7 ? 'person' : index === 7 ? 'invite' : 'open');
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-dark">Sample · Small Business</p>
          <p className="mt-1 text-lg font-semibold">8 of 19 seats</p>
          <p className="mt-1 text-sm text-muted">The owner is one. A pending invitation holds another.</p>
        </div>
        <p className="text-right text-2xl font-semibold tracking-tight">R119.99<span className="block text-xs font-medium text-muted">/month</span></p>
      </div>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-hover">
        <span className="w-[37%] bg-primary" />
        <span className="w-[5%] bg-teal" />
      </div>
      <div className="mt-4 grid grid-cols-10 gap-1.5" aria-hidden>
        {seats.map((kind, index) =>
        <span key={index} className={`flex h-8 items-center justify-center rounded-md text-[10px] font-semibold text-white ${kind === 'person' ? 'bg-primary' : kind === 'invite' ? 'bg-teal' : 'bg-hover text-muted ring-1 ring-line'}`}>
          {kind === 'open' ? '' : kind === 'invite' ? 'Inv' : index === 0 ? 'You' : ''}
        </span>
        )}
      </div>
      <ul className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> People, including the owner</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-teal" /> Invitation holding a seat</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-hover ring-1 ring-line" /> Still open</li>
      </ul>
    </div>
  );
}

const pricingFaqs = [
  { q: 'What counts as a user?', a: 'An active member of the organisation. The owner is included. A valid pending invitation reserves a seat as well.' },
  { q: 'Does the owner count?', a: 'Yes.' },
  { q: 'Do pending invitations use seats?', a: 'Yes, until they are accepted, cancelled, or expire. Expired and cancelled invitations release the seat.' },
  { q: 'What happens when my team grows?', a: 'You cannot invite past the plan. A larger plan applies only after someone with billing access confirms the new price.' },
  { q: 'Can I change plans?', a: 'Yes. Upgrades apply when you confirm them. A downgrade is refused if the people and valid invitations do not fit the smaller plan. Nobody is removed automatically.' },
  { q: 'How does annual billing work?', a: 'Plans for 6 or more people can be paid annually at 10% off twelve monthly amounts. Starter is monthly only.' },
  { q: 'What happens when payment fails?', a: 'Access to billing actions is restricted while the organisation is given a chance to pay. People are not deleted because a payment failed.' },
  { q: 'Can I cancel?', a: 'Cancellation is an explicit choice in the employer app. It is not triggered by viewing a smaller plan.' },
  { q: 'Are there hidden fees?', a: 'The prices on this page are the published subscription prices. This website does not add a setup fee. Commercial terms should still be read before you rely on them in a contract.' }
];

export function PricingPage() {
  const [annual, setAnnual] = useState(false);
  return (
    <>
      <Section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
        <div>
        <Kicker>Pricing in rand</Kicker>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight">Pricing designed to grow with your business.</h1>
        <p className="mt-4 max-w-2xl text-muted">Choose a subscription based on the size of the team. Employees join by invitation, and the business confirms every plan change.</p>
        </div>
        <SeatBoard />
      </Section>
      <Section className="pt-0">
        <div className="mt-6 inline-flex rounded-lg bg-hover p-1" role="group" aria-label="Billing period">
          <button type="button" className={`rounded-md px-3 py-1.5 text-sm font-semibold ${annual ? 'text-muted' : 'bg-surface text-ink shadow-card'}`} onClick={() => setAnnual(false)}>Monthly</button>
          <button type="button" className={`rounded-md px-3 py-1.5 text-sm font-semibold ${annual ? 'bg-surface text-ink shadow-card' : 'text-muted'}`} onClick={() => setAnnual(true)}>Annual · 10% off from 6 people</button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {plans.map((plan) => {
            const showAnnual = annual && plan.annual !== null;
            const price = plan.id === 'enterprise' ? 'From R270' : showAnnual ? rand(plan.annual as number) : rand(plan.monthly);
            const period = plan.id === 'enterprise' ? '/month minimum' : showAnnual ? '/year' : '/month';
            return (
              <article key={plan.id} className={`flex flex-col rounded-2xl border bg-surface p-5 ${plan.id === 'small' ? 'border-primary shadow-pop ring-2 ring-primary' : 'border-line'}`}>
                {plan.id === 'small' && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">A growing team</p>}
                <h2 className="text-base font-semibold">{plan.name}</h2>
                <p className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
                  <span className="whitespace-nowrap">{price}</span>
                  <span className="mt-1 block text-sm font-medium text-muted">{period}</span>
                </p>
                <p className="mt-2 text-sm text-muted">{plan.id === 'starter' ? 'Up to 5 people. Monthly billing only.' : plan.id === 'enterprise' ? '100 or more people. R2.70 per user per month, and at least R270.' : `${plan.minUsers}–${plan.maxUsers} people.`}</p>
                {annual && plan.id === 'starter' && <p className="mt-2 text-xs text-warning">Starter stays monthly. Annual billing starts at 6 people.</p>}
                {showAnnual && <p className="mt-2 text-xs text-success">10% off twelve monthly payments of {rand(plan.monthly)}.</p>}
                <div className="mt-auto pt-5"><ButtonLink to="/get-started" className="w-full">Get started</ButtonLink></div>
              </article>
            );
          })}
        </div>
      </Section>
      <Section className="pt-0">
        <h2 className="text-2xl font-semibold">How the price behaves</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-muted sm:grid-cols-2 lg:grid-cols-4">
          {([
            [UserRoundIcon, 'The owner counts as one user.'],
            [UsersIcon, 'Active employees count toward the limit.'],
            [MailIcon, 'A valid invitation reserves a seat until it is accepted, cancelled, or it expires.'],
            [ShieldCheckIcon, 'Nothing changes plan or price until the employer confirms it. There is no free plan.']
          ] as [LucideIcon, string][]).map(([Icon, text]) =>
          <li key={text} className="rounded-2xl border border-line bg-surface p-4">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-3">{text}</p>
          </li>
          )}
        </ul>
        <p className="mt-4 text-xs text-muted">Annual discount is {Math.round(ANNUAL_DISCOUNT * 100)}%. Published annual totals: Small Business {rand(1295.89)}, Medium Business {rand(1943.89)}, Large Business {rand(2483.89)}. Enterprise annual amounts depend on the agreed user count and are confirmed before you commit.</p>
      </Section>
      <Section className="pt-0">
        <h2 className="text-2xl font-semibold">Compare the plans</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-3 pr-4 font-medium">Plan</th>
              <th className="py-3 pr-4 font-medium">People</th>
              <th className="py-3 pr-4 font-medium">Monthly</th>
              <th className="py-3 pr-4 font-medium">Annual</th>
              <th className="py-3 font-medium">Core product</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) =>
            <tr key={plan.id} className="border-b border-line">
              <td className="py-3 pr-4 font-semibold">{plan.name}</td>
              <td className="py-3 pr-4">{plan.maxUsers ? plan.id === 'starter' ? `Up to ${plan.maxUsers}` : `${plan.minUsers}–${plan.maxUsers}` : `${plan.minUsers}+`}</td>
              <td className="py-3 pr-4">{plan.id === 'enterprise' ? 'From R270' : rand(plan.monthly)}</td>
              <td className="py-3 pr-4">{plan.annual ? rand(plan.annual) : plan.id === 'enterprise' ? '10% off the agreed monthly amount' : 'Not offered'}</td>
              <td className="py-3 text-muted"><span className="inline-flex items-center gap-1 text-success"><CheckIcon className="h-4 w-4" /> Included</span></td>
            </tr>
            )}
          </tbody>
        </table>
        </div>
        <p className="mt-3 text-xs text-muted">Every plan includes time, attendance, leave, corrections, reports, and the optional Windows agent. If a limit is added later, it will be shown before you confirm.</p>
      </Section>
      <Section className="pt-0">
        <h2 className="text-2xl font-semibold">Pricing questions</h2>
        <div className="mt-4"><FaqList items={pricingFaqs} /></div>
        <p className="mt-6 text-sm text-muted">A longer business conversation, including Enterprise, starts on the <Link to="/contact" className="font-semibold text-primary">contact page</Link>.</p>
      </Section>
      <CtaBand title="Pick a band that fits today." body="You can move later, and only when you confirm it." />
    </>
  );
}
