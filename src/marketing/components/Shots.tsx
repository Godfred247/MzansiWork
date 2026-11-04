import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CalendarCheckIcon, ClockIcon, MonitorIcon } from 'lucide-react';
import { AgentApp } from '../../pages/agent/AgentApp';
import { AgentDesktop } from '../../components/canvas/AgentDesktop';
import { PhoneFrame } from '../../components/canvas/PhoneFrame';
import { DemoProvider } from '../../contexts/DemoStore';
import { PresentationalProvider } from '../../contexts/Presentational';
import { EmployeeLayoutProvider } from '../../contexts/EmployeeLayout';
import { EmployerApp } from '../../pages/employer/EmployerApp';
import { MyDay } from '../../pages/employee/MyDay';

function Fit({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => setScale(Math.min(1, el.clientWidth / width));
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);
  return (
    <div ref={ref} className="w-full overflow-hidden" style={{ height: Math.round(height * scale) }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}

export function SampleFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <DemoProvider sample>
      <PresentationalProvider>
      <figure>
        <div className="pointer-events-none select-none" aria-hidden>{children}</div>
        <figcaption className="mt-3 text-xs text-muted">{label}</figcaption>
      </figure>
      </PresentationalProvider>
    </DemoProvider>
  );
}

function BrowserChrome({ children, width, height }: { children: ReactNode; width: number; height: number }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#CBD5E1] bg-surface shadow-frame" style={{ width, height }}>
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-[#F1F5F9] px-3">
        <span className="h-3 w-3 rounded-full bg-[#F87171]" />
        <span className="h-3 w-3 rounded-full bg-[#FBBF24]" />
        <span className="h-3 w-3 rounded-full bg-[#4ADE80]" />
        <div className="ml-2 flex h-7 min-w-0 flex-1 items-center rounded-md bg-surface px-2 text-[11px] text-muted ring-1 ring-line">
          app.mzansiwork.co.za/my-day
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-canvas">
        <EmployeeLayoutProvider width={width}>{children}</EmployeeLayoutProvider>
      </div>
    </div>
  );
}

export function EmployerWindow() {
  return (
    <Fit width={384} height={760}>
      <div className="h-[760px] w-[384px]">
        <PhoneFrame><EmployerApp /></PhoneFrame>
      </div>
    </Fit>
  );
}

export function EmployeeWindow() {
  return (
    <Fit width={980} height={640}>
      <BrowserChrome width={980} height={640}><MyDay /></BrowserChrome>
    </Fit>
  );
}

export function AgentWindow() {
  return (
    <Fit width={340} height={560}>
      <div className="h-[560px] w-[340px]">
        <AgentDesktop><AgentApp /></AgentDesktop>
      </div>
    </Fit>
  );
}

export function HeroCluster() {
  return (
    <SampleFrame label="The three apps together, using a sample organisation.">
      <div className="relative mx-auto h-[580px] max-w-[640px] overflow-hidden">
        <div className="absolute inset-x-0 top-0 hidden sm:block">
          <EmployeeWindow />
        </div>
        <div className="absolute right-0 top-6 z-10 w-[42%] max-sm:left-1/2 max-sm:w-[260px] max-sm:-translate-x-1/2">
          <EmployerWindow />
        </div>
        <div className="absolute bottom-6 left-0 z-20 hidden w-[34%] overflow-hidden sm:block" style={{ height: 168 }}>
          <AgentWindow />
        </div>
      </div>
    </SampleFrame>
  );
}

const reel = [
  { id: 'phone', label: 'Employer app', detail: 'Attendance, approvals and leave, on a phone.', icon: CalendarCheckIcon },
  { id: 'browser', label: 'Employee browser', detail: 'Clock in, breaks, the day’s timeline, and leave.', icon: MonitorIcon },
  { id: 'agent', label: 'Desktop agent', detail: 'Optional. The window says when it is watching idle time.', icon: ClockIcon }
] as const;

export function ProductReel() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % reel.length), 6500);
    return () => window.clearInterval(timer);
  }, []);
  const current = reel[index];
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-4 sm:px-8">
      <div className="overflow-hidden rounded-[28px] bg-navy-900 px-4 py-6 text-white sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">A sample day</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">See the product, not a description of it.</h2>
          </div>
          <p className="max-w-sm text-sm text-navy-100">{current.detail}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Product views">
          {reel.map((item, itemIndex) => {
            const Icon = item.icon;
            const on = itemIndex === index;
            return (
              <button key={item.id} type="button" role="tab" aria-selected={on} onClick={() => setIndex(itemIndex)} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${on ? 'bg-white text-navy' : 'bg-white/10 text-navy-100 hover:bg-white/15'}`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
        <DemoProvider sample>
          <PresentationalProvider>
          <div className="pointer-events-none relative mt-6 min-h-[420px] select-none" aria-hidden>
            {index === 0 && <div className="mx-auto max-w-[300px]"><EmployerWindow /></div>}
            {index === 1 && <EmployeeWindow />}
            {index === 2 && <div className="mx-auto max-w-[340px]"><AgentWindow /></div>}
          </div>
          </PresentationalProvider>
        </DemoProvider>
        <p className="mt-4 text-xs text-navy-300">Sample organisation. Nothing here writes to a real account. The view changes on its own, or pick one.</p>
      </div>
    </section>
  );
}

export function FeatureArt({ kind }: { kind: string }) {
  if (kind === 'attendance') {
    return (
      <div className="h-full rounded-xl bg-navy p-3 text-white">
        <p className="text-[10px] text-navy-100">On the clock now</p>
        <p className="text-2xl font-bold">7<span className="ml-1 text-xs font-medium text-navy-300">of 8</span></p>
        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className="w-[62%] bg-success" /><span className="w-[12%] bg-info" /><span className="w-[13%] bg-subtle" /><span className="w-[13%] bg-white/20" />
        </div>
        <p className="mt-2 text-[10px] text-navy-100">5 working · 1 break · 1 not in</p>
      </div>
    );
  }
  if (kind === 'time') {
    return (
      <div className="flex h-full flex-col justify-between rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center justify-between text-[11px]"><span className="font-semibold">Clocked in</span><span className="text-success">08:02</span></div>
        <p className="text-2xl font-semibold tracking-tight">02:28</p>
        <div className="h-8 rounded-lg bg-primary text-center text-[11px] font-semibold leading-8 text-white">Clock out</div>
      </div>
    );
  }
  if (kind === 'timesheet') {
    return (
      <div className="flex h-full items-end gap-1.5 rounded-xl border border-line bg-surface p-3">
        {[40, 62, 55, 70, 48, 18, 8].map((h, i) => <span key={i} className={`flex-1 rounded-sm ${i === 4 ? 'bg-primary' : 'bg-primary/25'}`} style={{ height: `${h}%` }} />)}
      </div>
    );
  }
  if (kind === 'break') {
    return (
      <div className="flex h-full flex-col justify-center gap-2 rounded-xl border border-line bg-surface p-3 text-[11px]">
        <div className="flex justify-between rounded-lg bg-info-soft px-2 py-1.5"><span>Tea</span><span>15 min</span></div>
        <div className="flex justify-between rounded-lg bg-hover px-2 py-1.5"><span>Lunch</span><span>32 min</span></div>
        <div className="rounded-lg bg-teal-soft px-2 py-1.5 font-semibold text-teal-dark">Start a break</div>
      </div>
    );
  }
  if (kind === 'leave') {
    return (
      <div className="flex h-full flex-col justify-center gap-2 rounded-xl border border-line bg-surface p-3 text-[11px]">
        <div className="flex items-center justify-between"><span className="font-semibold">Annual leave</span><span className="rounded-full bg-warning-soft px-2 py-0.5 text-warning">Waiting</span></div>
        <p className="text-muted">12–13 Nov · 2 days</p>
        <div className="grid grid-cols-2 gap-1"><span className="rounded-md bg-success py-1 text-center font-semibold text-white">Approve</span><span className="rounded-md bg-hover py-1 text-center">Decline</span></div>
      </div>
    );
  }
  if (kind === 'people') {
    return (
      <div className="flex h-full flex-col justify-center gap-2 rounded-xl border border-line bg-surface p-3 text-[11px]">
        {[['TN', 'Thandi Nkosi', 'In'], ['AP', 'Aisha Patel', 'Break'], ['SK', 'Sipho Khumalo', 'Out']].map(([ini, name, status]) =>
        <div key={name} className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[9px] font-semibold text-white">{ini}</span>
          <span className="flex-1">{name}</span>
          <span className="text-muted">{status}</span>
        </div>
        )}
      </div>
    );
  }
  if (kind === 'agent') {
    return (
      <div className="flex h-full flex-col justify-center rounded-xl bg-[#1B3354] p-3 text-white">
        <p className="text-[10px] uppercase tracking-wide text-navy-100">Windows agent · optional</p>
        <p className="mt-1 text-lg font-semibold">Active</p>
        <p className="mt-1 text-[11px] leading-snug text-navy-100">Idle is recorded. The screen is not.</p>
      </div>
    );
  }
  if (kind === 'correction') {
    return (
      <div className="flex h-full flex-col justify-center gap-2 rounded-xl border border-warning-line bg-warning-soft p-3 text-[11px]">
        <p className="font-semibold">Idle · 10:14–10:36</p>
        <p>Client call away from the desk.</p>
        <p className="font-semibold text-warning">Original time kept</p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-end rounded-xl border border-line bg-surface p-3">
      <div className="flex items-end gap-1">
        {[30, 48, 36, 64, 52].map((h, i) => <span key={i} className="flex-1 rounded-sm bg-teal" style={{ height: h }} />)}
      </div>
      <p className="mt-2 text-[10px] text-muted">Hours · exceptions · export</p>
    </div>
  );
}

const scenes: Record<string, { wash: string; title: string }> = {
  '/industries/small-business': { wash: 'from-navy to-navy-700', title: 'Five people. One record.' },
  '/industries/professional-services': { wash: 'from-[#1D4ED8] to-teal', title: 'Hours across clients.' },
  '/industries/construction': { wash: 'from-[#9A3412] to-navy', title: 'The site office, not a GPS tag.' },
  '/industries/logistics': { wash: 'from-navy-700 to-[#0369A1]', title: 'Branches you name.' },
  '/industries/retail': { wash: 'from-teal-dark to-navy', title: 'Who opened the shop.' },
  '/industries/cleaning': { wash: 'from-[#0F766E] to-[#14213D]', title: 'Teams between sites.' },
  '/industries/remote': { wash: 'from-[#1E3A8A] to-teal-dark', title: 'The browser is the clock.' },
  '/industries/growing-smes': { wash: 'from-navy to-primary', title: 'A plan that widens.' }
};

export function IndustryCover({ to, tall = false }: { to: string; tall?: boolean }) {
  const scene = scenes[to] ?? { wash: 'from-navy to-primary', title: 'A South African team' };
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${scene.wash} ${tall ? 'h-48' : 'h-28'}`}>
      <svg viewBox="0 0 240 80" className="absolute inset-x-0 bottom-0 h-16 w-full text-white/25" aria-hidden>
        <path fill="currentColor" d="M0 80V46l28-18 22 12 30-24 26 16 34-22 28 18 32-14 40 20v46H0z" />
        <rect x="36" y="40" width="22" height="40" fill="white" opacity="0.35" />
        <rect x="64" y="28" width="18" height="52" fill="white" opacity="0.2" />
        <rect x="148" y="34" width="40" height="46" fill="white" opacity="0.28" />
      </svg>
      <p className="absolute left-4 top-4 max-w-[12rem] text-sm font-semibold text-white">{scene.title}</p>
    </div>
  );
}
