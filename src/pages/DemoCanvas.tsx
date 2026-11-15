import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { AgentDesktop } from '../components/canvas/AgentDesktop';
import { BrowserFrame } from '../components/canvas/BrowserFrame';
import { EventFeed } from '../components/canvas/EventFeed';
import { FlowGuide } from '../components/canvas/FlowGuide';
import { FrameLabel } from '../components/canvas/FrameLabel';
import { PhoneFrame } from '../components/canvas/PhoneFrame';
import { TopBar } from '../components/canvas/TopBar';
import { useDemo } from '../contexts/DemoStore';
import { flows } from '../data/flows';
import type { AppId } from '../types/org';
import { viewerRoleLabel } from '../utils/permissions';
import { actorMember } from '../utils/selectors';
import { AgentApp } from './agent/AgentApp';
import { DocsView } from './docs/DocsView';
import { EmployeeApp } from './employee/EmployeeApp';
import { EmployerApp } from './employer/EmployerApp';

function useWindowWidth() {
  const [w, setW] = useState(typeof window === 'undefined' ? 1440 : window.innerWidth);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

const tabs: {id: AppId;label: string;}[] = [
{ id: 'employer', label: 'Employer mobile' },
{ id: 'employee', label: 'Employee browser' },
{ id: 'agent', label: 'Windows agent' }];


export function DemoCanvas() {
  const { state } = useDemo();
  const person = actorMember(state);
  const width = useWindowWidth();
  const narrow = width < 1280;
  const [tab, setTab] = useState<AppId>('employer');
  const flow = state.flow ? flows.find((f) => f.id === state.flow?.id) : undefined;
  const nextApp = flow?.steps[state.flow?.step ?? 0]?.app;

  useEffect(() => {
    if (narrow && nextApp && nextApp !== 'canvas') setTab(nextApp);
  }, [narrow, nextApp]);

  const single: AppId | null = state.focus ?? (narrow ? tab : null);
  const show = (id: AppId) => single === null || single === id;

  return (
    <div className="flex h-screen w-full flex-col bg-canvas">
      <TopBar />
      {state.view === 'docs' ?
      <DocsView /> :

      <main className="relative min-h-0 flex-1">
          {narrow && !state.focus &&
        <div role="tablist" aria-label="Choose app" className="flex gap-1 border-b border-line bg-surface px-4 py-2">
              {tabs.map((t) =>
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={twMerge('rounded-md px-3 py-1.5 text-[13px] font-medium', tab === t.id ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-hover')}>
            
                  {t.label}
                  {nextApp === t.id && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" aria-label="next step" />}
                </button>
          )}
            </div>
        }
          <div className={twMerge('flex h-full min-h-0 gap-5 overflow-x-auto p-5', narrow && !state.focus && 'h-[calc(100%-49px)]', single && 'justify-center')}>
            {show('employer') &&
          <section aria-label="Employer mobile app" className="flex min-h-0 shrink-0 flex-col">
                <FrameLabel app="employer" title="Employer mobile" meta={`iOS / Android · ${viewerRoleLabel(state.viewerRole)}`} />
                <PhoneFrame highlight={nextApp === 'employer'}>
                  <EmployerApp />
                </PhoneFrame>
              </section>
          }
            {show('employee') &&
          <section aria-label="Employee browser app" className={twMerge('flex min-h-0 flex-col', single ? 'w-full max-w-[1280px]' : 'min-w-[600px] flex-1')}>
                <FrameLabel app="employee" title="Employee browser" meta={state.employeeAuthed && person ? `${person.name} · ${person.department}` : 'Sign in'} />
                <div className="min-h-0 flex-1">
                  <BrowserFrame highlight={nextApp === 'employee'}>
                    <EmployeeApp />
                  </BrowserFrame>
                </div>
              </section>
          }
            {show('agent') &&
          <section aria-label="Windows desktop agent" className="flex min-h-0 w-[400px] shrink-0 flex-col">
                <FrameLabel app="agent" title="Windows agent" meta={state.employeeAuthed && person ? `${person.name} · v1.4.2` : 'Sign in'} />
                <AgentDesktop highlight={nextApp === 'agent'}>
                  <AgentApp />
                </AgentDesktop>
                <div className="mt-4 flex min-h-[140px] flex-1 flex-col">
                  <EventFeed />
                </div>
              </section>
          }
          </div>
          <FlowGuide />
        </main>
      }
    </div>);

}