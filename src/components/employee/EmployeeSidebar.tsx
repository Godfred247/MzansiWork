import { twMerge } from 'tailwind-merge';
import { useClock, useDemo } from '../../contexts/DemoStore';
import { employeeNav } from '../../data/employeeNav';
import { fmtClock } from '../../utils/time';
import { actorMember } from '../../utils/selectors';
import { Avatar } from '../shared/Avatar';
import { Logo } from '../shared/Logo';
import { EmployeeNavIcon } from './EmployeeNavIcon';

export function EmployeeSidebar({ rail }: {rail?: boolean;}) {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const unread = state.notifications.filter((n) => n.app === 'employee' && !n.read).length;
  const se = state.session;
  const me = actorMember(state);
  const active = se.state === 'clocked_in' || se.state === 'on_break';

  return (
    <nav aria-label="Employee navigation" className={twMerge('flex shrink-0 flex-col border-r border-line bg-surface', rail ? 'w-16 items-center' : 'w-60')}>
      <div className={twMerge('flex h-14 items-center', rail ? 'justify-center' : 'px-4')}>
        <Logo size="sm" showName={!rail} />
      </div>
      {!rail &&
      <button
        onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'day' } })}
        className={twMerge('mx-3 mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px]', active ? se.state === 'on_break' ? 'bg-info-soft text-info' : 'bg-success-soft text-success' : 'bg-hover text-muted')}>
        
          <span className={twMerge('h-2 w-2 rounded-full', active ? se.state === 'on_break' ? 'bg-info' : 'bg-success' : 'bg-subtle')} aria-hidden />
          <span className="font-medium">{se.state === 'on_break' ? 'On break' : active ? 'Clocked in' : se.state === 'ended' ? 'Clocked out' : 'Not clocked in'}</span>
          {active && se.clockInSec !== undefined && <span className="tnum ml-auto text-xs">{fmtClock(clock - se.clockInSec)}</span>}
        </button>
      }
      <ul className={twMerge('flex flex-1 flex-col gap-0.5', rail ? 'px-2' : 'px-3')}>
        {employeeNav.map((item) => {
          const current = state.employeeRoute.name === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: item.id } })}
                aria-current={current ? 'page' : undefined}
                aria-label={rail ? item.label : undefined}
                title={rail ? item.label : undefined}
                className={twMerge(
                  'relative flex h-9 w-full items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150',
                  rail ? 'justify-center' : 'px-3',
                  current ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-hover hover:text-ink'
                )}>
                
                <EmployeeNavIcon id={item.id} className="h-4 w-4 shrink-0" />
                {!rail && <span className="truncate">{item.label}</span>}
                {item.id === 'notifications' && unread > 0 &&
                <span className={twMerge('tnum rounded-full bg-danger px-1.5 text-[10px] font-semibold text-white', rail ? 'absolute right-1 top-1' : 'ml-auto')}>{unread}</span>
                }
              </button>
            </li>);

        })}
      </ul>
      <div className={twMerge('flex items-center gap-2.5 border-t border-line py-3', rail ? 'justify-center' : 'px-4')}>
        <Avatar name={me?.name ?? 'Employee'} size="sm" />
        {!rail &&
        <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-ink">{me?.name ?? 'Not signed in'}</p>
            <p className="truncate text-xs text-muted">{state.org.name}</p>
          </div>
        }
      </div>
    </nav>);

}