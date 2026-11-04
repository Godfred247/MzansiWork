import { useState } from 'react';
import { ClockIcon, InboxIcon, ShieldCheckIcon } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { LegalDialog } from '../../../components/shared/LegalDialog';
import { Logo } from '../../../components/shared/Logo';
import { useDemo } from '../../../contexts/DemoStore';
import { brand } from '../../../data/brand';

const points = [
{ icon: ClockIcon, text: 'See who is working, on break or not yet in — live.' },
{ icon: InboxIcon, text: 'Approve corrections and leave with a full audit trail.' },
{ icon: ShieldCheckIcon, text: 'Fair, transparent tracking your team can see too.' }];


export function Welcome() {
  const { dispatch } = useDemo();
  const [doc, setDoc] = useState<'privacy' | 'terms' | null>(null);
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface px-6 pb-8 pt-10">
      <Logo size="lg" />
      <h1 className="mt-8 text-[28px] font-bold leading-tight tracking-tight text-ink">Workforce time, made clear.</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{brand.tagline} Built for Southern Africa.</p>
      <ul className="mt-6 space-y-3">
        {points.map((p) =>
        <li key={p.text} className="flex items-start gap-3 text-[14px] text-ink">
            <p.icon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            {p.text}
          </li>
        )}
      </ul>
      <div className="mt-auto space-y-2.5">
        <Button full size="lg" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'signin' } })}>Sign in</Button>
        <Button full size="lg" variant="secondary" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'create' } })}>Create an organisation account</Button>
        <button onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'forgot' } })} className="w-full py-1 text-center text-[13px] font-medium text-primary">Forgot password?</button>
        <p className="pt-2 text-center text-[11px] leading-relaxed text-muted">
          All organisations use a paid subscription — there’s no free plan. Want a walkthrough first? <span className="font-medium text-primary">Book a guided demo</span>.
          <br />
          <button type="button" onClick={() => setDoc('privacy')} className="underline">Privacy notice</button>
          {' · '}
          <button type="button" onClick={() => setDoc('terms')} className="underline">Terms of service</button>
        </p>
      </div>
      <LegalDialog doc={doc} onClose={() => setDoc(null)} />
    </div>);

}