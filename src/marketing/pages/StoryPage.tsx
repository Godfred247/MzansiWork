import { Link, useLocation } from 'react-router-dom';
import { industryLinks, solutionLinks, stories, storyByPath } from '../content';
import { AgentWindow, EmployeeWindow, EmployerWindow, FeatureArt, IndustryCover, SampleFrame } from '../components/Shots';
import { ButtonLink, CtaBand, FaqList, Kicker, Section } from '../components/Ui';

function artKind(path: string) {
  if (path.includes('attendance')) return 'attendance';
  if (path.includes('timesheet')) return 'timesheet';
  if (path.includes('break')) return 'break';
  if (path.includes('leave')) return 'leave';
  if (path.includes('employee') || path.includes('small')) return 'people';
  if (path.includes('desktop') || path.includes('accountab')) return 'agent';
  if (path.includes('correction')) return 'correction';
  if (path.includes('report')) return 'report';
  return 'time';
}

function StoryShot({ path }: { path: string }) {
  const employee = /time-tracking|break|employee-app|remote/.test(path);
  const agent = /desktop|correction|accountability/.test(path);
  return (
    <SampleFrame label="Sample interface. It is not connected to an organisation.">
      {agent ? <div className="mx-auto max-w-[340px]"><AgentWindow /></div> : employee ? <EmployeeWindow /> : <div className="mx-auto max-w-[300px]"><EmployerWindow /></div>}
    </SampleFrame>
  );
}

export function StoryPage() {
  const { pathname } = useLocation();
  const story = storyByPath(pathname);
  if (!story) return null;
  return (
    <>
      <Section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
        <div>
          <Kicker>{story.kind === 'industry' ? 'Industry' : story.kind === 'solution' ? 'Solution' : 'Product'}</Kicker>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight">{story.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{story.lede}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to="/get-started">Get started</ButtonLink>
            <ButtonLink to="/pricing" tone="secondary">See pricing</ButtonLink>
          </div>
        </div>
        {story.kind === 'industry' ? <div className="overflow-hidden rounded-3xl shadow-frame"><IndustryCover to={story.path} tall /><div className="bg-surface p-5"><p className="text-sm text-muted">{story.problem}</p></div></div> : <StoryShot path={story.path} />}
      </Section>
      <Section className="grid gap-4 pt-0 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <article className="rounded-3xl bg-navy p-6 text-white">
          <h2 className="text-xl font-semibold">The problem</h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-100">{story.problem}</p>
        </article>
        <div className="grid gap-3 sm:grid-cols-2">
          {story.points.map((point) =>
          <article key={point.title} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-semibold">{point.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{point.body}</p>
          </article>
          )}
        </div>
      </Section>
      <Section className="pt-0">
        <h2 className="text-xl font-semibold">Workflow</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {story.steps.map((step, index) =>
          <li key={step.title} className="relative overflow-hidden rounded-2xl border border-line bg-surface p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-soft text-sm font-semibold text-teal-dark">{index + 1}</span>
            <p className="mt-3 text-sm font-semibold">{step.title}</p>
            <p className="mt-1 text-sm text-muted">{step.body}</p>
          </li>
          )}
        </ol>
      </Section>
      <Section className="grid gap-4 pt-0 md:grid-cols-2">
        <article className="rounded-2xl bg-navy p-6 text-white">
          <h2 className="text-lg font-semibold">For the employer</h2>
          <ul className="mt-3 space-y-2 text-sm text-navy-100">{story.employer.map((line) => <li key={line}>{line}</li>)}</ul>
        </article>
        {story.employee.length > 0 &&
        <article className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">For the employee</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">{story.employee.map((line) => <li key={line}>{line}</li>)}</ul>
        </article>
        }
      </Section>
      {story.note && <p className="mx-auto max-w-6xl px-5 text-sm text-muted sm:px-8">{story.note}</p>}
      {story.faqs.length > 0 &&
      <Section>
        <h2 className="text-xl font-semibold">Questions</h2>
        <div className="mt-4"><FaqList items={story.faqs} /></div>
      </Section>
      }
      <Section className="pt-0">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Related</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {story.related.map((link) => <Link key={link.to} to={link.to} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium">{link.label}</Link>)}
        </div>
      </Section>
      <CtaBand title="See it against a plan that fits." body="Prices are in rand. The application opens when you are ready to create an organisation or sign in." />
    </>
  );
}

export function CatalogPage({ kind }: { kind: 'product' | 'solutions' | 'industries' }) {
  const copy = {
    product: { kicker: 'Product', title: 'One platform, three surfaces', lede: 'The employer phone, the employee browser, and an optional Windows agent share one record of time.', items: stories.filter((story) => story.kind === 'feature').map((story) => ({ to: story.path, label: story.title, note: story.lede })) },
    solutions: { kicker: 'Solutions', title: 'Start from the business problem', lede: 'Each solution is tied to a feature that exists today. Nothing here depends on GPS, biometrics, or a payroll engine.', items: solutionLinks },
    industries: { kicker: 'Industries', title: 'Written for South African workplaces', lede: 'Use cases for the way teams actually work. These pages do not claim you as a customer, and they do not add features the product does not have.', items: industryLinks }
  }[kind];
  return (
    <Section>
      <Kicker>{copy.kicker}</Kicker>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{copy.title}</h1>
      <p className="mt-4 max-w-2xl text-muted">{copy.lede}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {copy.items.map((item) =>
        <Link key={item.to + item.label} to={item.to} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-line">
          {kind === 'industries' ? <IndustryCover to={item.to} /> : <div className="h-28 border-b border-line bg-canvas p-3"><FeatureArt kind={artKind(item.to)} /></div>}
          <div className="p-5">
            <h2 className="text-base font-semibold">{item.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.note}</p>
          </div>
        </Link>
        )}
      </div>
    </Section>
  );
}
