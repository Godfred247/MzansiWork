import { CheckIcon, LifeBuoyIcon, MailIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { PageHeader } from '../../components/employee/PageHeader';
import { useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { brand } from '../../data/brand';
import { collected, notCollected, trackingPolicy } from '../../data/policy';

export function TrackingPolicy() {
  const { state } = useDemo();
  const layout = useEmployeeLayout();
  const card = 'rounded-2xl border border-line bg-surface p-5';

  return (
    <div className={twMerge('mx-auto max-w-4xl', layout === 'narrow' ? 'space-y-4 p-4' : 'space-y-6 p-8')}>
      <PageHeader title="Help & Tracking Policy" description={`${trackingPolicy.name} · ${trackingPolicy.version}`} />

      <section aria-labelledby="col-h" className={card}>
        <h2 id="col-h" className="text-sm font-semibold text-ink">What is collected, and when</h2>
        <ul className="mt-3 divide-y divide-line">
          {collected.map((c) =>
          <li key={c.item} className="flex items-start gap-3 py-3">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <div>
                <p className="text-[13px] font-medium text-ink">{c.item}</p>
                <p className="text-xs text-muted">{c.when} · {c.visible ? 'Visible to you, your manager and HR' : 'Technical — visible to support only'}</p>
              </div>
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="not-h" className={card}>
        <h2 id="not-h" className="text-sm font-semibold text-ink">Never collected</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {notCollected.map((n) =>
          <li key={n} className="flex items-center gap-2 text-[13px] text-ink"><XIcon className="h-4 w-4 text-danger" aria-hidden />{n}</li>
          )}
        </ul>
      </section>

      <div className={twMerge('grid gap-6', layout !== 'narrow' && 'grid-cols-2')}>
        <section aria-labelledby="when-h" className={card}>
          <h2 id="when-h" className="text-sm font-semibold text-ink">Starting and stopping</h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink/80">
            <li><strong className="text-ink">Starts</strong> when you clock in and the desktop agent is signed in.</li>
            <li><strong className="text-ink">Pauses</strong> during recorded breaks.</li>
            <li><strong className="text-ink">Stops</strong> when you clock out, sign out of the agent, or exit it.</li>
            <li>Idle threshold: <strong className="text-ink">{trackingPolicy.idleThresholdMin} minutes</strong> (set by your employer).</li>
          </ul>
        </section>
        <section aria-labelledby="use-h" className={card}>
          <h2 id="use-h" className="text-sm font-semibold text-ink">How observations are used</h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink/80">
            <li>To help you and your manager review timesheets accurately.</li>
            <li>Idle time is <strong className="text-ink">never deducted automatically</strong>. Disputed time is decided by a person, with a recorded reason.</li>
            <li>Original records are never edited; corrections are stored alongside them.</li>
            <li>Retention: {trackingPolicy.retention}.</li>
          </ul>
        </section>
      </div>

      <section aria-labelledby="help-h" className={card}>
        <h2 id="help-h" className="text-sm font-semibold text-ink">Something looks wrong?</h2>
        <p className="mt-1 text-[13px] text-muted">Request a correction from My Timesheets, or contact your organisation directly.</p>
        <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
          <span className="flex items-center gap-2 text-ink"><MailIcon className="h-4 w-4 text-muted" aria-hidden />HR · Nomsa Khumalo · nomsa@mzansiwork.co.za</span>
          <span className="flex items-center gap-2 text-ink"><LifeBuoyIcon className="h-4 w-4 text-muted" aria-hidden />{brand.name} support · {brand.supportEmail}</span>
        </div>
        <p className="mt-3 text-xs text-muted">{state.org.name} is responsible for this policy. It must be reviewed against South African privacy and employment law before production use.</p>
      </section>
    </div>);

}