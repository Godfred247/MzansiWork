import { useState } from 'react';
import { EyeOffIcon, ExternalLinkIcon, Loader2Icon, MonitorIcon, ShieldCheckIcon, SlidersHorizontalIcon } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { Logo } from '../../components/shared/Logo';
import { useDemo } from '../../contexts/DemoStore';
import { trackingPolicy } from '../../data/policy';

export function AgentOnboarding({ step }: {step: 'welcome' | 'signin';}) {
  const { state, dispatch } = useDemo();
  const [waiting, setWaiting] = useState(false);
  const expired = state.agent.connection === 'session_expired';

  if (step === 'welcome') {
    return (
      <div className="scroll-thin flex flex-1 flex-col overflow-y-auto p-5">
        <Logo tone="dark" size="lg" showName={false} />
        <h1 className="mt-4 text-lg font-semibold">Welcome to the MzansiWork desktop agent</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-navy-300">A small companion to your employee portal. It runs only while you’re clocked in and signed in.</p>
        <ul className="mt-5 space-y-3.5">
          {[
          { icon: MonitorIcon, title: 'What it does', body: `Notes when your computer becomes idle (no input for ${trackingPolicy.idleThresholdMin} min, set by your employer) and active again — timestamps only.` },
          { icon: EyeOffIcon, title: 'What it never does', body: 'No keystrokes, screenshots, camera, microphone, browsing history or messages.' },
          { icon: SlidersHorizontalIcon, title: 'You stay informed', body: 'Its status is always visible here and in the system tray. You can explain any interval.' }].
          map((i) =>
          <li key={i.title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10"><i.icon className="h-4 w-4 text-[#5EEAD4]" aria-hidden /></span>
              <span>
                <span className="block text-[13px] font-semibold">{i.title}</span>
                <span className="block text-xs leading-relaxed text-navy-300">{i.body}</span>
              </span>
            </li>
          )}
        </ul>
        <div className="mt-auto pt-5">
          <Button full onClick={() => dispatch({ type: 'AGENT_FIRST_RUN_DONE' })}>Continue</Button>
          <p className="mt-2 text-center text-[11px] text-navy-300">Using this agent is optional unless your employer’s policy says otherwise.</p>
        </div>
      </div>);

  }

  return (
    <div className="flex flex-1 flex-col p-5">
      <Logo tone="dark" size="md" />
      <h1 className="mt-6 text-lg font-semibold">{expired ? 'Your session expired' : 'Sign in'}</h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-navy-300">
        {expired ?
        'Observations are paused until you sign in again. Events already saved on this computer are kept and will sync afterwards.' :
        'Sign-in happens securely in your browser. This window never asks for your password.'}
      </p>
      {waiting ?
      <div className="mt-6 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
          <p className="flex items-center gap-2 text-[13px] font-medium"><Loader2Icon className="h-4 w-4 animate-spin text-[#93C5FD]" aria-hidden />Waiting for your browser…</p>
          <p className="mt-1 text-xs text-navy-300">Finish signing in at app.mzansiwork.co.za/agent-link, then return here.</p>
          <button onClick={() => setWaiting(false)} className="mt-3 text-xs font-medium text-[#93C5FD] hover:underline">Cancel</button>
        </div> :

      <Button
        className="mt-6"
        full
        icon={<ExternalLinkIcon className="h-4 w-4" />}
        onClick={() => {
          setWaiting(true);
          window.setTimeout(() => {
            setWaiting(false);
            dispatch({ type: 'AGENT_SIGN_IN' });
          }, 1300);
        }}>
        
          {expired ? 'Sign in again with browser' : 'Sign in with browser'}
        </Button>
      }
      <p className="mt-auto flex items-start gap-2 text-[11px] leading-relaxed text-navy-300">
        <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Nothing is recorded while you’re signed out.
      </p>
    </div>);

}