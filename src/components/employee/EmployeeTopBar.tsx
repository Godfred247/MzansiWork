import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, MenuIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { employeeNav } from '../../data/employeeNav';
import { actorMember } from '../../utils/selectors';
import { fmtClock } from '../../utils/time';
import { IconButton } from '../shared/IconButton';
import { Logo } from '../shared/Logo';
import { EmployeeNavIcon } from './EmployeeNavIcon';

export function EmployeeTopBar() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const [open, setOpen] = useState(false);
  const unread = state.notifications.filter((n) => n.app === 'employee' && !n.read).length;
  const se = state.session;
  const me = actorMember(state);
  const active = se.state === 'clocked_in' || se.state === 'on_break';

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3">
        <IconButton label="Open menu" onClick={() => setOpen(true)}>
          <MenuIcon className="h-5 w-5" />
        </IconButton>
        <Logo size="sm" />
        {active && se.clockInSec !== undefined &&
        <span className={twMerge('tnum ml-auto rounded-full px-2.5 py-1 text-xs font-medium', se.state === 'on_break' ? 'bg-info-soft text-info' : 'bg-success-soft text-success')}>
            {se.state === 'on_break' ? 'Break' : 'In'} · {fmtClock(clock - se.clockInSec)}
          </span>
        }
        <IconButton label="Notifications" badge={unread} className={active ? '' : 'ml-auto'} onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'notifications' } })}>
          <BellIcon className="h-5 w-5" />
        </IconButton>
      </header>
      <AnimatePresence>
        {open &&
        <div className="absolute inset-0 z-50">
            <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setOpen(false)} />
            <motion.nav
            aria-label="Employee navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-surface shadow-pop">
            
              <div className="flex h-14 items-center justify-between px-4">
                <Logo size="sm" />
                <IconButton label="Close menu" onClick={() => setOpen(false)}>
                  <XIcon className="h-5 w-5" />
                </IconButton>
              </div>
              <ul className="flex flex-col gap-0.5 px-3">
                {employeeNav.map((item) =>
              <li key={item.id}>
                    <button
                  onClick={() => {
                    dispatch({ type: 'EMPLOYEE_NAV', route: { name: item.id } });
                    setOpen(false);
                  }}
                  aria-current={state.employeeRoute.name === item.id ? 'page' : undefined}
                  className={twMerge(
                    'flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium',
                    state.employeeRoute.name === item.id ? 'bg-primary-soft text-primary' : 'text-ink hover:bg-hover'
                  )}>
                  
                      <EmployeeNavIcon id={item.id} className="h-4 w-4" />
                      {item.label}
                    </button>
                  </li>
              )}
              </ul>
              <p className="mt-auto border-t border-line px-4 py-3 text-xs text-muted">{me?.name ?? 'Not signed in'} · {state.org.name || 'No organisation'}</p>
            </motion.nav>
          </div>
        }
      </AnimatePresence>
    </>);

}