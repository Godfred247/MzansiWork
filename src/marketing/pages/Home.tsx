import { Link } from 'react-router-dom';
import { EyeIcon, FileCheckIcon, ShieldCheckIcon, type LucideIcon } from 'lucide-react';
import { plans } from '../../data/plans';
import { homeFaqs, industryLinks, solutionLinks } from '../content';
import { rand } from '../format';
import { AgentWindow, EmployeeWindow, EmployerWindow, FeatureArt, HeroCluster, IndustryCover, ProductReel, SampleFrame } from '../components/Shots';
import { ButtonLink, CtaBand, FaqList, Kicker, Section } from '../components/Ui';

const features = [
  { to: '/product/time-tracking', title: 'Employee time tracking', body: 'The workday starts and ends on a button the employee can see.', kind: 'time' },
  { to: '/product/attendance', title: 'Attendance management', body: 'Who is working, on a break, out, or not yet in.', kind: 'attendance' },
  { to: '/product/timesheets', title: 'Timesheet management', body: 'Daily, weekly, and monthly hours from real sessions.', kind: 'timesheet' },
  { to: '/product/break-management', title: 'Break management', body: 'Breaks use the categories your organisation chooses.', kind: 'break' },
  { to: '/product/leave-management', title: 'Leave management', body: 'Requests and decisions. Balances are yours to configure.', kind: 'leave' },
  { to: '/product/employee-management', title: 'Employee management', body: 'Invitations, roles, and seats that include the owner.', kind: 'people' },
  { to: '/product/desktop-agent', title: 'Activity observations', body: 'The optional Windows agent notes idle and active time.', kind: 'agent' },
  { to: '/product/corrections', title: 'Corrections and approvals', body: 'An explanation, a decision, and the original time kept.', kind: 'correction' },
  { to: '/product/reporting', title: 'Reporting', body: 'Attendance, hours, and exceptions, ready to export.', kind: 'report' }
];

const local = [
  { title: 'Rand pricing', body: 'Every published price is in South African rand. Starter is R89 a month.' },
  { title: 'Africa/Johannesburg', body: 'That time zone is the default. Times are stored and shown against it.' },
  { title: 'Public holidays you configure', body: 'A holiday calendar can be set for the organisation. The product does not silently apply a legal calendar.' },
  { title: 'Policies you write', body: 'Schedules, leave types, and approvals follow the rules you enter. Have those rules checked legally before you rely on them.' },
  { title: 'Plans that widen', body: 'From five people to a hundred and beyond, with a confirmed change when you cross a band.' },
  { title: 'Office, remote, and hybrid', body: 'The browser is the clock. The desktop agent is optional for computer-based work.' }
];

export function Home() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
        <div>
          <Kicker>South African workforce software</Kicker>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Manage your people. Track your time. Run your business with confidence.</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">MzansiWork brings employee attendance, working hours, timesheets, leave and workforce reporting together for South African businesses.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonLink to="/pricing">Explore plans</ButtonLink>
            <ButtonLink to="/tour" tone="secondary">See how it works</ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted">Already using MzansiWork? <Link to="/login" className="font-medium text-primary">Log in</Link></p>
        </div>
        <HeroCluster />
      </section>
      <ProductReel />

      <Section className="pt-0">
        <div className="rounded-3xl bg-navy px-6 py-10 text-white sm:px-10">
          <h2 className="text-2xl font-semibold">Workforce management should be clear for everyone.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {([
              [EyeIcon, 'Visibility for employers', 'The day is on a phone: who is in, who is on a break, and what still needs a decision.'],
              [ShieldCheckIcon, 'Transparency for employees', 'People record their own time and can explain a disputed interval. Idle time is not treated as proof.'],
              [FileCheckIcon, 'Records for the business', 'Original times stay after a correction. An export helps payroll preparation. It is not a pay run.']
            ] as [LucideIcon, string, string][]).map(([Icon, title, body]) =>
            <div key={title} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <Icon className="h-5 w-5 text-teal" />
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-100">{body}</p>
            </div>
            )}
          </div>
        </div>
      </Section>

      <Section>
        <Kicker>The platform</Kicker>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">What the product actually does</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) =>
          <Link key={feature.title} to={feature.to} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-colors hover:border-primary-line">
            <div className="h-32 border-b border-line bg-canvas p-3"><FeatureArt kind={feature.kind} /></div>
            <div className="p-5">
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              <p className="mt-4 text-sm font-semibold text-primary">See this feature</p>
            </div>
          </Link>
          )}
        </div>
      </Section>

      <Section className="pt-0">
        <Kicker>How it works</Kicker>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three steps, three connected apps</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['1', 'Set up the business', 'The owner creates the organisation, confirms a paid plan, and invites employees. The owner is the first seat.'],
            ['2', 'The team records time', 'Employees use the browser to clock in, take breaks, and review their own timesheets. The Windows agent is optional.'],
            ['3', 'You manage and review', 'The employer app is where attendance, corrections, leave, and reports are handled.']
          ].map(([n, title, body]) =>
          <li key={n} className="rounded-2xl border border-line bg-surface p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-soft text-sm font-semibold text-teal-dark">{n}</span>
            <h3 className="mt-4 text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </li>
          )}
        </ol>
      </Section>

      <Section className="grid items-center gap-10 pt-0 lg:grid-cols-2">
        <SampleFrame label="Employer app · sample organisation, Monday 26 October.">
          <div className="mx-auto max-w-[320px]"><EmployerWindow /></div>
        </SampleFrame>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Employer mobile app</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Manage the workforce from the phone.</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Attendance for the day, including who is on a break.</li>
            <li>Approvals, leave, and the people you invited.</li>
            <li>Reports and the subscription, in the same app.</li>
          </ul>
          <Link to="/product/employer-app" className="mt-5 inline-block text-sm font-semibold text-primary">Explore employer features</Link>
        </div>
      </Section>

      <Section className="grid items-center gap-10 pt-0 lg:grid-cols-2">
        <div className="lg:order-2">
          <SampleFrame label="Employee browser · the same sample day.">
            <EmployeeWindow />
          </SampleFrame>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Employee browser</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">The workday lives in the browser.</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Clock in and out, with the task they are on.</li>
            <li>Breaks, their own timeline, and their own timesheet.</li>
            <li>A place to explain time away from the computer, and to request leave.</li>
          </ul>
          <Link to="/product/employee-app" className="mt-5 inline-block text-sm font-semibold text-primary">Explore employee features</Link>
        </div>
      </Section>

      <Section className="grid items-center gap-10 pt-0 lg:grid-cols-2">
        <SampleFrame label="Windows agent · optional, and visible on the machine.">
          <div className="mx-auto max-w-[360px]"><AgentWindow /></div>
        </SampleFrame>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Windows desktop agent</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Computer activity, with the window open.</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>It shows when tracking is on.</li>
            <li>It records idle and active transitions. It does not capture the screen.</li>
            <li>The employee can still explain work done away from the desk.</li>
          </ul>
          <Link to="/product/desktop-agent" className="mt-5 inline-block text-sm font-semibold text-primary">Explore desktop tracking</Link>
        </div>
      </Section>

      <Section className="pt-0">
        <Kicker>Local</Kicker>
        <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight">Designed with South African businesses in mind</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">Prices, the default time zone, and the examples are for businesses operating in South Africa. The product can serve a wider region later. It does not replace payroll software or a lawyer.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {local.map((item) =>
          <article key={item.title} className="rounded-2xl bg-teal-soft p-5">
            <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </article>
          )}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-8 rounded-3xl border border-line bg-surface p-6 md:grid-cols-2 md:p-10">
          <div>
            <Kicker>Privacy</Kicker>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Time tracking should be transparent and fair.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">MzansiWork separates an observation about a computer from a decision about worked time. Employees know when the optional agent is active. Inactivity is not automatically unpaid time.</p>
            <Link to="/tracking-policy" className="mt-4 inline-block text-sm font-semibold text-primary">Read the tracking policy</Link>
          </div>
          <ul className="space-y-3 text-sm leading-relaxed text-muted">
            <li>Employees know when tracking is on.</li>
            <li>The agent says what it observes, and what it refuses to collect.</li>
            <li>Idle time is not proof that work did not happen.</li>
            <li>People can explain work done away from the computer.</li>
            <li>Managers review corrections. Original events remain.</li>
          </ul>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="text-3xl font-semibold tracking-tight">Solutions by need</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {solutionLinks.map((item) =>
          <Link key={item.to} to={item.to} className="rounded-2xl border border-line bg-surface p-4 hover:border-primary-line">
            <h3 className="text-sm font-semibold">{item.label}</h3>
            <p className="mt-1 text-sm text-muted">{item.note}</p>
          </Link>
          )}
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="text-3xl font-semibold tracking-tight">Workplaces it is written for</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">These are use cases, not a list of customers. Specialist hardware such as GPS, biometrics, or roster engines is not part of the product.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {industryLinks.map((item) =>
          <Link key={item.to} to={item.to} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <IndustryCover to={item.to} />
            <div className="p-4">
              <h3 className="text-sm font-semibold">{item.label}</h3>
              <p className="mt-1 text-sm text-muted">{item.note}</p>
            </div>
          </Link>
          )}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>Pricing</Kicker>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Simple pricing. No unexpected upgrades.</h2>
          </div>
          <Link to="/pricing" className="text-sm font-semibold text-primary">View all plans</Link>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-5">
          {plans.map((plan) =>
          <article key={plan.id} className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="text-sm font-semibold">{plan.name}</h3>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{plan.id === 'enterprise' ? 'From R270' : rand(plan.monthly)}<span className="text-sm font-medium text-muted">/mo</span></p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{plan.id === 'starter' ? 'Up to 5 people. Monthly only.' : plan.id === 'enterprise' ? 'R2.70 per user, at least R270.' : `${plan.minUsers}–${plan.maxUsers} people.`}</p>
          </article>
          )}
        </div>
        <p className="mt-4 text-sm text-muted">The owner counts as one user. A valid invitation reserves a seat. There is no free plan, and a plan does not change until you confirm the price.</p>
      </Section>

      <Section className="pt-0">
        <h2 className="text-3xl font-semibold tracking-tight">Questions owners ask first</h2>
        <div className="mt-6"><FaqList items={homeFaqs.slice(0, 6)} /></div>
        <Link to="/faq" className="mt-4 inline-block text-sm font-semibold text-primary">All questions</Link>
      </Section>

      <CtaBand title="Ready to bring your workforce together?" body="Choose a plan that fits the business and start with a record your team can see." />
    </>
  );
}
