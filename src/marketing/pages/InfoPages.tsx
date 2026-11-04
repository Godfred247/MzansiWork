import { useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpenIcon, LifeBuoyIcon, NewspaperIcon } from 'lucide-react';
import { brand } from '../../data/brand';
import { legal } from '../../data/legal';
import { articles, guides, homeFaqs } from '../content';
import { AgentWindow, EmployeeWindow, EmployerWindow, FeatureArt, SampleFrame } from '../components/Shots';
import { ButtonLink, CtaBand, FaqList, Kicker, Section } from '../components/Ui';

const helpTopics = [
  { title: 'Getting started', body: 'Create an organisation, confirm a paid plan, and invite people.', to: '/get-started' },
  { title: 'Accounts and invitations', body: 'The owner is a seat. A pending invitation holds another.', to: '/product/employee-management' },
  { title: 'Time tracking', body: 'Clock in and out from the employee browser.', to: '/product/time-tracking' },
  { title: 'Attendance', body: 'The employer phone shows the day.', to: '/product/attendance' },
  { title: 'Timesheets', body: 'Hours come from sessions, then corrections.', to: '/product/timesheets' },
  { title: 'Breaks', body: 'Categories are yours to name.', to: '/product/break-management' },
  { title: 'Leave', body: 'Requests and configured balances. Not legal advice.', to: '/product/leave-management' },
  { title: 'Desktop agent', body: 'Optional. Idle and active only.', to: '/product/desktop-agent' },
  { title: 'Privacy', body: 'What is stored, and what is refused.', to: '/privacy' },
  { title: 'Billing', body: 'Five paid plans. Changes need confirmation.', to: '/pricing' },
  { title: 'Support', body: 'Write to the contact form. Signed-in help continues in the application.', to: '/contact' }
];

export function FaqPage() {
  const [query, setQuery] = useState('');
  const items = homeFaqs.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(query.toLowerCase().trim()));
  return (
    <>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <Kicker><span className="text-teal">FAQ</span></Kicker>
          <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight">Questions, answered plainly</h1>
          <label className="mt-6 block text-sm font-medium" htmlFor="faq-search">Search</label>
          <input id="faq-search" value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 w-full max-w-md rounded-lg border border-white/10 bg-white px-3 py-2 text-sm text-ink" placeholder="Seats, agent, leave…" />
        </div>
      </section>
      <Section>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="grid h-28 grid-cols-3 gap-2 lg:block lg:h-auto lg:space-y-2">
            <div className="h-full rounded-2xl bg-canvas p-2 lg:h-24"><FeatureArt kind="attendance" /></div>
            <div className="h-full rounded-2xl bg-canvas p-2 lg:mt-2 lg:h-24"><FeatureArt kind="time" /></div>
            <div className="h-full rounded-2xl bg-canvas p-2 lg:mt-2 lg:h-24"><FeatureArt kind="agent" /></div>
          </aside>
          <div>{items.length ? <FaqList items={items} /> : <p className="text-sm text-muted">Nothing matches that search. Try “seat” or “agent”, or <Link to="/contact" className="text-primary">contact us</Link>.</p>}</div>
        </div>
      </Section>
    </>
  );
}

export function HelpPage() {
  const [query, setQuery] = useState('');
  const topics = helpTopics.filter((topic) => `${topic.title} ${topic.body}`.toLowerCase().includes(query.toLowerCase().trim()));
  return (
    <Section>
      <Kicker>Help centre</Kicker>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Public help, before you sign in</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">These articles explain the product. Account-specific help continues after you log in to the application.</p>
      <label className="mt-6 block text-sm font-medium" htmlFor="help-search">Search</label>
      <input id="help-search" value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 w-full max-w-md rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic, index) =>
        <Link key={topic.title} to={topic.to} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <div className="h-24 border-b border-line bg-canvas p-3"><FeatureArt kind={['time', 'people', 'attendance', 'timesheet', 'break', 'leave', 'agent', 'correction', 'report', 'people', 'time'][index] ?? 'time'} /></div>
          <div className="p-5">
            <h2 className="text-base font-semibold">{topic.title}</h2>
            <p className="mt-2 text-sm text-muted">{topic.body}</p>
          </div>
        </Link>
        )}
      </div>
    </Section>
  );
}

export function ResourcesPage() {
  return (
    <Section>
      <Kicker>Resources</Kicker>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Notes for people running a South African team</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">Guides and short articles. No invented customer stories. Calculators for overtime or cost are not published yet, so they are not pretended here.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link to="/resources/guides" className="overflow-hidden rounded-3xl bg-navy text-white">
          <div className="h-36 bg-white/10 p-4"><BookOpenIcon className="h-8 w-8 text-teal" /></div>
          <div className="p-6">
            <h2 className="text-xl font-semibold">Guides</h2>
            <p className="mt-2 text-sm text-navy-100">How to start, and how the three apps fit.</p>
          </div>
        </Link>
        <Link to="/resources/blog" className="overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="h-36 bg-canvas p-4"><NewspaperIcon className="h-8 w-8 text-primary" /></div>
          <div className="p-6">
            <h2 className="text-xl font-semibold">Articles</h2>
            <p className="mt-2 text-sm text-muted">Seats, idle time, and how to introduce tracking.</p>
          </div>
        </Link>
        <Link to="/help" className="overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="h-36 bg-teal-soft p-4"><LifeBuoyIcon className="h-8 w-8 text-teal-dark" /></div>
          <div className="p-6">
            <h2 className="text-xl font-semibold">Help centre</h2>
            <p className="mt-2 text-sm text-muted">Public answers, before you sign in.</p>
          </div>
        </Link>
      </div>
    </Section>
  );
}

export function GuidesPage() {
  return (
    <Section>
      <Kicker>Guides</Kicker>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Getting started and day-to-day use</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {guides.map((guide, index) =>
        <Link key={guide.title} to={guide.to} className="flex gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{index + 1}</span>
          <span>
            <h2 className="text-base font-semibold">{guide.title}</h2>
            <p className="mt-1 text-sm text-muted">{guide.body}</p>
          </span>
        </Link>
        )}
      </div>
    </Section>
  );
}

export function BlogPage() {
  return (
    <Section>
      <Kicker>Articles</Kicker>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Practical notes</h1>
      <p className="mt-3 text-sm text-muted">Categories in use: time tracking, workforce management, remote working. These are product explanations, not client case studies.</p>
      <div className="mt-8 grid gap-4">
        {articles.map((article) =>
        <Link key={article.slug} to={`/resources/blog/${article.slug}`} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card md:grid md:grid-cols-[180px_1fr]">
          <div className="h-28 bg-gradient-to-br from-navy to-teal p-4 text-sm font-semibold text-white md:h-full">{article.category}</div>
          <div className="p-5">
            <h2 className="text-xl font-semibold">{article.title}</h2>
            <p className="mt-2 text-sm text-muted">{article.lede}</p>
          </div>
        </Link>
        )}
      </div>
    </Section>
  );
}

export function ArticlePage() {
  const { slug } = useParams();
  const article = articles.find((item) => item.slug === slug);
  if (!article) {
    return <Section><h1 className="text-2xl font-semibold">That article is not published.</h1><Link to="/resources/blog" className="mt-3 inline-block text-sm text-primary">Back to articles</Link></Section>;
  }
  return (
    <Section className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <nav className="h-fit rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-24" aria-label="On this page">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">On this page</p>
        <ul className="mt-2 space-y-1">{article.sections.map((section) => <li key={section.heading}><a href={`#${section.heading}`} className="text-sm text-primary">{section.heading}</a></li>)}</ul>
      </nav>
      <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-dark">{article.category}</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight">{article.title}</h1>
      <p className="mt-3 text-sm text-muted">Updated {article.updated}</p>
      <p className="mt-4 max-w-2xl text-base text-muted">{article.lede}</p>
      <div className="mt-8 max-w-2xl space-y-6">
        {article.sections.map((section) =>
        <section key={section.heading} id={section.heading}>
          <h2 className="text-xl font-semibold">{section.heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
        </section>
        )}
      </div>
      <p className="mt-8 text-sm">Related: <Link to="/tracking-policy" className="text-primary">Tracking policy</Link> · <Link to="/contact" className="text-primary">Contact</Link></p>
      </div>
    </Section>
  );
}

export function AboutPage() {
  return (
    <Section className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <Kicker>About</Kicker>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">MzansiWork exists so a South African business can see its hours without hiding the method.</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <p>Small teams lose time to notebooks and Friday reconstructions. Larger teams lose it to inboxes and tools that watch more than they admit. MzansiWork is the narrower product: attendance, working time, leave you configure, and an optional idle signal that is declared.</p>
          <p>The employer uses a phone. The employee uses a browser. The Windows agent is optional and refuses screenshots, keystrokes, and cameras. Prices are in rand. There is no free organisation, and a plan does not change until the business confirms it.</p>
          <p>There is no invented founding myth on this page, and no customer count. The longer aim is a workforce record that a five-person firm and a much larger organisation can both explain to their people.</p>
        </div>
      </div>
      <SampleFrame label="The employer app, using a sample organisation.">
        <div className="mx-auto max-w-[300px]"><EmployerWindow /></div>
      </SampleFrame>
    </Section>
  );
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', organisation: '', size: '1–5', type: 'Product question', message: '' });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2) return setError('Enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a business email.');
    if (form.message.trim().length < 10) return setError('Write a short message.');
    setError('');
    setSent(true);
  };
  return (
    <Section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
      <Kicker>Contact</Kicker>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Ask before you subscribe</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">Product questions, subscription questions, Enterprise, partnerships, and technical support use this form. No telephone number or street address is published yet. The configured mailbox is {brand.supportEmail}. This preview does not send the message.</p>
      {sent ?
      <div className="mt-8 max-w-lg rounded-2xl border border-teal-line bg-teal-soft p-5">
        <h2 className="text-lg font-semibold">Noted on this page</h2>
        <p className="mt-2 text-sm text-muted">Nothing was emailed. When the mailbox is connected, messages will go to {brand.supportEmail}. You can still <Link to="/get-started" className="text-primary">create an organisation</Link> or <Link to="/pricing" className="text-primary">compare plans</Link>.</p>
      </div> :
      <form className="mt-8 grid max-w-lg gap-4" onSubmit={submit} noValidate>
        <label className="text-sm font-medium">Name<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="text-sm font-medium">Business email<input type="email" className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label className="text-sm font-medium">Organisation<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.organisation} onChange={(event) => setForm({ ...form, organisation: event.target.value })} /></label>
        <label className="text-sm font-medium">Team size
          <select className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })}>
            {['1–5', '6–19', '20–39', '40–99', '100+'].map((size) => <option key={size}>{size}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Enquiry
          <select className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {['Product question', 'Subscription', 'Enterprise', 'Partnership', 'Technical support'].map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Message<textarea className="mt-1 w-full rounded-lg border border-line px-3 py-2" rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <button type="submit" className="h-11 rounded-lg bg-primary text-sm font-semibold text-white">Send message</button>
      </form>
      }
      </div>
      <aside className="grid gap-3">
        {['Product question', 'Subscription', 'Enterprise', 'Technical support'].map((item, index) =>
        <div key={item} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="h-16 bg-canvas p-2"><FeatureArt kind={['time', 'people', 'report', 'agent'][index]} /></div>
          <p className="px-4 py-3 text-sm font-semibold">{item}</p>
        </div>
        )}
      </aside>
    </Section>
  );
}

export function LegalPage({ doc }: { doc: 'privacy' | 'terms' | 'cookies' | 'subscription' | 'tracking' }) {
  const pages = {
    privacy: { title: legal.privacy.title, intro: legal.privacy.intro, sections: legal.privacy.sections, extra: 'This notice is a product explanation. It is not a POPIA certificate and it should be reviewed before publication as a legal notice.' },
    terms: { title: legal.terms.title, intro: legal.terms.intro, sections: legal.terms.sections, extra: 'Subscription behaviour described here matches the application: paid plans, owner seats, and confirmed changes.' },
    cookies: { title: 'Cookie note', intro: 'This marketing site stores one preference: whether you accepted cookies or kept the choice essential. The preference lives in this browser.', sections: [{ heading: 'What is stored', body: 'A single value, mzansi.cookies, set to all or essential. No advertising profile is built in this preview.' }, { heading: 'The application', body: 'Signing in to the application uses its own session storage for the sign-in token. That is separate from this cookie choice.' }], extra: 'You can change the choice by clearing this site’s storage in the browser.' },
    subscription: { title: 'Subscription terms', intro: 'These are the commercial rules the product enforces today. Have them reviewed before they are used as a contract.', sections: legal.terms.sections.filter((section) => section.heading === 'Seats' || section.heading === 'Plans and prices' || section.heading === 'The customer'), extra: 'These rules match the application: paid plans, owner seats, and confirmed changes.' },
    tracking: { title: 'Employee tracking policy', intro: 'Share this with the team before you turn on the optional Windows agent.', sections: [{ heading: 'What can be observed', body: 'Clock times, breaks, leave requests, corrections, and, if the agent is installed and signed in, operating-system idle and active transitions.' }, { heading: 'What is not collected', body: 'Keystrokes, screenshots, webcam, microphone, and GPS.' }, { heading: 'How a dispute works', body: 'The employee explains the interval. A manager decides. The original timestamp remains.' }, { heading: 'Review', body: 'This policy must be read against the privacy and employment law that applies to the organisation. MzansiWork does not certify that reading for you.' }], extra: 'This is a product explanation, not a legal opinion.' }
  }[doc];
  return (
    <>
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">{pages.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy-100">{pages.intro}</p>
      </div>
    </section>
    <Section className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <nav className="text-sm" aria-label="On this page">
        {pages.sections.map((section) => <a key={section.heading} href={`#${section.heading}`} className="block py-1 text-muted hover:text-primary">{section.heading}</a>)}
      </nav>
      <div>
      <div className="mt-8 max-w-2xl space-y-6">
        {pages.sections.map((section) =>
        <section key={section.heading} id={section.heading}>
          <h2 className="text-lg font-semibold">{section.heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
        </section>
        )}
      </div>
      <p className="mt-8 max-w-2xl text-sm text-muted">{pages.extra}</p>
      </div>
    </Section>
    </>
  );
}

const tourSteps = [
  { title: 'Employer dashboard', body: 'Sample data: 6 of 8 people are on the clock. This screen does not update a real organisation.' },
  { title: 'Employee clock-in', body: 'The sample employee starts a day at 08:02 and chooses a task called Client work.' },
  { title: 'Attendance timeline', body: 'Work, a 32-minute break, and an idle observation are shown as separate intervals.' },
  { title: 'Timesheet correction', body: 'The employee explains the idle interval as a client call. The original idle time remains in the sample.' },
  { title: 'Leave approval', body: 'A sample request for two days is waiting. Approving it here does not write to a database.' },
  { title: 'Windows agent', body: 'The sample window says Active. It also says it does not capture the screen.' },
  { title: 'Subscription', body: 'The sample organisation is on Small Business, monthly, 8 of 19 seats. Changing plan here does nothing.' }
];

export function TourPage() {
  const [step, setStep] = useState(0);
  const current = tourSteps[step];
  const label = useMemo(() => `Step ${step + 1} of ${tourSteps.length}`, [step]);
  return (
    <Section>
      <Kicker>Demonstration</Kicker>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">A tour with sample data</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">Nothing on this tour creates an organisation, invites a person, or changes a subscription.</p>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[240px_1fr]">
        <ol className="space-y-1">
          {tourSteps.map((item, index) =>
          <li key={item.title}>
            <button type="button" onClick={() => setStep(index)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${index === step ? 'bg-primary-soft font-semibold text-primary' : 'text-muted hover:bg-hover'}`}>{index + 1}. {item.title}</button>
          </li>
          )}
        </ol>
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <SampleFrame label="Sample only. These controls do not change an organisation.">
            {step === 5 ? <div className="mx-auto max-w-[320px]"><AgentWindow /></div> : step === 1 || step === 2 || step === 3 ? <EmployeeWindow /> : <div className="mx-auto max-w-[280px]"><EmployerWindow /></div>}
          </SampleFrame>
          <article>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label} · sample</p>
            <h2 className="mt-2 text-2xl font-semibold">{current.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{current.body}</p>
            <div className="mt-6 flex gap-2">
              <button type="button" className="rounded-lg border border-line px-3 py-2 text-sm font-semibold disabled:opacity-40" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Back</button>
              <button type="button" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-40" disabled={step === tourSteps.length - 1} onClick={() => setStep((value) => value + 1)}>Next</button>
            </div>
          </article>
        </div>
      </div>
    </Section>
  );
}

export function EntryPage({ mode }: { mode: 'login' | 'start' }) {
  if (mode === 'login') {
    return (
      <Section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Kicker>Existing customers</Kicker>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Log in to the application</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">Employers sign in with the organisation email. Employees sign in with the work email on their invitation. Both continue in the application, where you choose which one you are.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to="/app">Continue to sign in</ButtonLink>
            <ButtonLink to="/product/employee-app" tone="secondary">Employee portal explained</ButtonLink>
          </div>
        </div>
        <SampleFrame label="A sample sign-in day, not your organisation.">
          <EmployeeWindow />
        </SampleFrame>
      </Section>
    );
  }
  return (
    <>
      <Section>
        <Kicker>New customers</Kicker>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Start with a paid plan</h1>
        <ol className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
          {[
            'Create the organisation. You become the owner, and you count as a seat.',
            'Confirm a plan in rand. There is no free organisation.',
            'Invite employees up to the seats you have. Each valid invitation reserves one.',
            'They accept in the browser. You manage the day on the phone.'
          ].map((step, index) =>
          <li key={step} className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{index + 1}</span>
            <p className="mt-3">{step}</p>
          </li>
          )}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to="/app">Create an organisation</ButtonLink>
          <ButtonLink to="/pricing" tone="secondary">Compare plans first</ButtonLink>
        </div>
        <p className="mt-4 text-sm text-muted">Enterprise conversations can start on the <Link to="/contact" className="text-primary">contact page</Link> before you subscribe.</p>
      </Section>
      <CtaBand title="The application is the next step." body="The marketing site stays here. Sign-up and sign-in open the MzansiWork application." />
    </>
  );
}

export function NotFoundPage() {
  return (
    <Section>
      <h1 className="text-3xl font-semibold">That page is not on the site.</h1>
      <Link to="/" className="mt-4 inline-block text-sm font-semibold text-primary">Back to the homepage</Link>
    </Section>
  );
}
