import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

export function TextLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return <Link to={to} className={twMerge('font-medium text-primary hover:underline', className)}>{children}</Link>;
}

export function ButtonLink({ to, children, tone = 'primary', className }: { to: string; children: ReactNode; tone?: 'primary' | 'secondary' | 'inverse'; className?: string }) {
  const tones = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'border border-line bg-surface text-ink hover:bg-hover',
    inverse: 'bg-white text-navy hover:bg-navy-50'
  };
  return (
    <Link to={to} className={twMerge('inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold', tones[tone], className)}>
      {children}
    </Link>
  );
}

export function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return <section id={id} className={twMerge('mx-auto w-full max-w-6xl px-5 py-16 sm:px-8', className)}>{children}</section>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-dark">{children}</p>;
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map((item) =>
      <details key={item.q} className="group px-5 py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
          {item.q}
          <span aria-hidden className="text-lg leading-none text-muted group-open:rotate-45">+</span>
        </summary>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{item.a}</p>
      </details>
      )}
    </div>
  );
}

export function CtaBand({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
      <div className="rounded-3xl bg-navy px-6 py-12 text-white sm:px-12">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-100">{body}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ButtonLink to="/get-started" tone="inverse">Get started</ButtonLink>
          <Link to="/pricing" className="inline-flex h-11 items-center rounded-lg px-4 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/10">Explore pricing</Link>
          <Link to="/login" className="text-sm font-medium text-navy-100 underline-offset-2 hover:underline">Already using MzansiWork? Log in</Link>
        </div>
      </div>
    </section>
  );
}

export function DeviceCluster() {
  return (
    <div className="relative mx-auto h-[460px] w-full max-w-xl" aria-hidden>
      <div className="absolute left-0 top-16 hidden w-[280px] rounded-xl border border-line bg-surface p-3 shadow-pop sm:block">
        <div className="flex items-center gap-2 border-b border-line pb-2 text-[11px] text-muted">
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="ml-2 truncate">Employee browser</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-ink">My day</p>
        <p className="text-[11px] text-muted">Clocked out · your own record</p>
        <div className="mt-3 h-2 rounded-full bg-hover"><span className="block h-2 w-2/3 rounded-full bg-primary" /></div>
        <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[10px] text-muted">
          <span className="rounded-md bg-hover py-2">In 08:02</span>
          <span className="rounded-md bg-hover py-2">Break 32m</span>
          <span className="rounded-md bg-hover py-2">Out 16:40</span>
        </div>
      </div>
      <div className="absolute right-0 top-0 w-[210px] rounded-[28px] border border-navy bg-navy p-2 shadow-frame">
        <div className="rounded-[22px] bg-surface px-3 pb-4 pt-5">
          <p className="text-[10px] text-muted">Employer</p>
          <p className="text-sm font-semibold text-ink">Attendance</p>
          <div className="mt-3 rounded-xl bg-navy px-3 py-3 text-white">
            <p className="text-[10px] text-navy-100">On the clock</p>
            <p className="text-2xl font-bold">6<span className="ml-1 text-xs font-medium text-navy-300">of 8</span></p>
          </div>
          <ul className="mt-3 space-y-2 text-[11px]">
            <li className="flex justify-between"><span>In</span><span className="text-success">6</span></li>
            <li className="flex justify-between"><span>Break</span><span>1</span></li>
            <li className="flex justify-between"><span>Not in</span><span>1</span></li>
          </ul>
        </div>
      </div>
      <div className="absolute bottom-2 right-8 w-[230px] rounded-xl bg-[#1B3354] p-3 text-white shadow-pop">
        <p className="text-[10px] uppercase tracking-wide text-navy-100">Windows agent · optional</p>
        <p className="mt-1 text-sm font-semibold">Active</p>
        <p className="text-[11px] text-navy-100">Idle is an observation, not a verdict. No screen capture.</p>
      </div>
    </div>
  );
}
