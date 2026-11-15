import { useEffect } from 'react';
import { LockIcon } from 'lucide-react';
import { ApiError, api, readToken } from '../../api/client';
import { loadLeaveSetup } from '../../api/leave';
import { EmployeeSidebar } from '../../components/employee/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/employee/EmployeeTopBar';
import { IssueBanner } from '../../components/employee/IssueBanner';
import { AccessDenied } from '../../components/shared/AccessDenied';
import { Button } from '../../components/shared/Button';
import { ToastHost } from '../../components/shared/ToastHost';
import { useDemo } from '../../contexts/DemoStore';
import { useEmployeeLayout } from '../../contexts/EmployeeLayout';
import { isLiveOrg } from '../../utils/workspace';
import type { EmployeeWorkOptions } from '../../types/workspace';
import { BrowserSignup, EmployeeAuth } from './EmployeeAuth';
import { EmployeeNotifications } from './EmployeeNotifications';
import { MyActivity } from './MyActivity';
import { MyDay } from './MyDay';
import { MyLeave } from './MyLeave';
import { MyProfile } from './MyProfile';
import { MyTasks } from './MyTasks';
import { MyTimesheets } from './MyTimesheets';
import { TrackingPolicy } from './TrackingPolicy';

const emptyWorkOptions: EmployeeWorkOptions = { projects: [], tasks: [], categories: [] };

export function EmployeeApp() {
  const { state, dispatch } = useDemo();
  const layout = useEmployeeLayout();

  useEffect(() => {
    if (!state.employeeAuthed || !isLiveOrg(state.orgId) || state.flow) return;
    let active = true;
    const token = readToken('employee');
    if (!token) {
      dispatch({ type: 'SET_EMPLOYEE_WORK_OPTIONS', options: emptyWorkOptions });
      dispatch({ type: 'TOAST', app: 'employee', message: 'Your sign-in has expired. Sign in again to load your saved work options.', tone: 'danger' });
      return;
    }

    dispatch({ type: 'SET_EMPLOYEE_WORK_OPTIONS', options: emptyWorkOptions, loading: true });
    void api<EmployeeWorkOptions>('/api/employee/work-options', { token })
      .then((options) => {
        if (active) dispatch({ type: 'SET_EMPLOYEE_WORK_OPTIONS', options });
      })
      .catch((caught: unknown) => {
        if (!active) return;
        dispatch({ type: 'SET_EMPLOYEE_WORK_OPTIONS', options: emptyWorkOptions });
        dispatch({
          type: 'TOAST',
          app: 'employee',
          message: caught instanceof ApiError ? caught.message : 'Your saved work options could not be loaded.',
          tone: 'danger'
        });
      });

    void loadLeaveSetup(token).then((setup) => {
      if (active) dispatch({ type: 'SET_LEAVE_SETUP', ...setup, replaceOpenings: false });
    }).catch(() => undefined);

    return () => { active = false; };
  }, [state.employeeAuthed, state.employeeMemberId, state.orgId, state.flow, dispatch]);

  if (!state.employeeAuthed) {
    return (
      <>
        {state.employeeRoute.name === 'signup' ? <BrowserSignup /> : <EmployeeAuth />}
        <ToastHost app="employee" />
      </>);

  }

  if (state.employeeIssue === 'session_expired') {
    return (
      <div className="flex h-full items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-warning-soft text-warning">
            <LockIcon className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="text-lg font-semibold text-ink">Your session has expired</h1>
          <p className="mt-2 text-sm text-muted">For your security we signed you out after a period of inactivity. Your clock status is safe on the server — signing in again won’t create a new clock-in.</p>
          <Button full className="mt-5" onClick={() => dispatch({ type: 'EMPLOYEE_SIGN_IN' })}>
            Sign in again
          </Button>
        </div>
      </div>);

  }

  const r = state.employeeRoute.name;
  const page =
  r === 'day' ? <MyDay /> :
  r === 'timesheets' ? <MyTimesheets /> :
  r === 'activity' ? <MyActivity /> :
  r === 'leave' ? <MyLeave /> :
  r === 'tasks' ? <MyTasks /> :
  r === 'notifications' ? <EmployeeNotifications /> :
  r === 'profile' ? <MyProfile /> :
  r === 'policy' ? <TrackingPolicy /> :
  r === 'denied' ?
  <AccessDenied
    title="This page is for employers"
    body="You followed a link to an employer-only area. Your account can see your own records, but not organisation billing, other employees’ records, or admin settings."
    attempted={state.employeeRoute.params?.path}
    role="Employee — own records only"
    actions={<Button onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'day' } })}>Back to My Day</Button>} /> :

  <MyDay />;

  return (
    <div className="relative flex h-full min-h-0">
      {layout !== 'narrow' && <EmployeeSidebar rail={layout === 'medium'} />}
      <div className="flex min-w-0 flex-1 flex-col">
        {layout === 'narrow' && <EmployeeTopBar />}
        <IssueBanner />
        <main className="scroll-thin min-h-0 flex-1 overflow-y-auto">{page}</main>
      </div>
      <ToastHost app="employee" />
    </div>);

}