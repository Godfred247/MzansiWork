import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from '../../components/employer/BottomNav';
import { Button } from '../../components/shared/Button';
import { ToastHost } from '../../components/shared/ToastHost';
import { useDemo } from '../../contexts/DemoStore';
import type { EmployerScreen } from '../../types/nav';
import { AuditHistory } from './account/AuditHistory';
import { EmailTemplates } from './account/EmailTemplates';
import { LiveWorkspace } from './account/LiveWorkspace';
import { EmployerNotifications } from './account/EmployerNotifications';
import { HelpSupport } from './account/HelpSupport';
import { ProfileSecurity } from './account/ProfileSecurity';
import { Approvals } from './approvals/Approvals';
import { CorrectionReview } from './approvals/CorrectionReview';
import { LeaveReview } from './approvals/LeaveReview';
import { Attendance } from './attendance/Attendance';
import { AttendanceDetail } from './attendance/AttendanceDetail';
import { Cancellation } from './billing/Cancellation';
import { ComparePlans } from './billing/ComparePlans';
import { FailedPayment } from './billing/FailedPayment';
import { PlanChange } from './billing/PlanChange';
import { Subscription } from './billing/Subscription';
import { Dashboard } from './home/Dashboard';
import { LeaveManagement } from './leave/LeaveManagement';
import { More } from './more/More';
import { CreateAccount } from './onboarding/CreateAccount';
import { EmployerSignIn } from './onboarding/EmployerSignIn';
import { ForgotPassword } from './onboarding/ForgotPassword';
import { InviteFirst } from './onboarding/InviteFirst';
import { OnboardingDone } from './onboarding/OnboardingDone';
import { OrgDetails } from './onboarding/OrgDetails';
import { PlanSelect } from './onboarding/PlanSelect';
import { Welcome } from './onboarding/Welcome';
import { OrgSettings } from './org/OrgSettings';
import { Projects } from './org/Projects';
import { RolesPermissions } from './org/RolesPermissions';
import { TrackingPolicyAdmin } from './org/TrackingPolicyAdmin';
import { EmployeeProfile } from './people/EmployeeProfile';
import { Employees } from './people/Employees';
import { InviteEmployee } from './people/InviteEmployee';
import { SeatUsage } from './people/SeatUsage';
import { ExportCentre } from './reports/ExportCentre';
import { ReportDetail } from './reports/ReportDetail';
import { Reports } from './reports/Reports';

const screens: Record<EmployerScreen, React.ComponentType> = {
  welcome: Welcome,
  signin: EmployerSignIn,
  forgot: ForgotPassword,
  create: CreateAccount,
  org: OrgDetails,
  plan: PlanSelect,
  'invite-first': InviteFirst,
  done: OnboardingDone,
  dashboard: Dashboard,
  attendance: Attendance,
  'attendance-detail': AttendanceDetail,
  employees: Employees,
  employee: EmployeeProfile,
  invite: InviteEmployee,
  seats: SeatUsage,
  approvals: Approvals,
  correction: CorrectionReview,
  'leave-request': LeaveReview,
  more: More,
  reports: Reports,
  report: ReportDetail,
  exports: ExportCentre,
  emails: EmailTemplates,
  live: LiveWorkspace,
  leave: LeaveManagement,
  projects: Projects,
  settings: OrgSettings,
  policy: TrackingPolicyAdmin,
  roles: RolesPermissions,
  subscription: Subscription,
  compare: ComparePlans,
  'plan-change': PlanChange,
  'failed-payment': FailedPayment,
  cancel: Cancellation,
  audit: AuditHistory,
  notifications: EmployerNotifications,
  profile: ProfileSecurity,
  help: HelpSupport
};

const onboarding: EmployerScreen[] = ['welcome', 'signin', 'forgot', 'create', 'org', 'plan', 'invite-first', 'done'];

export function EmployerApp() {
  const { state, dispatch } = useDemo();
  const running = state.exports.filter((x) => x.status === 'running').map((x) => `${x.id}:${x.willFail ? 1 : 0}`).join('|');

  useEffect(() => {
    if (!running) return;
    const timers = running.split('|').map((entry) => {
      const [id, fail] = entry.split(':');
      return window.setTimeout(() => dispatch({ type: 'EXPORT_DONE', id, ok: fail !== '1' }), 2200);
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [running, dispatch]);

  const route = state.employerStack[state.employerStack.length - 1];
  const Screen = screens[route.name] ?? Dashboard;
  const showNav = state.employerAuthed && !onboarding.includes(route.name);
  const browserSignup = state.employeeRoute.name === 'signup' && !state.employerAuthed && onboarding.includes(route.name) && route.name !== 'welcome' && route.name !== 'signin' && route.name !== 'forgot';
  const key = `${state.employerStack.length}-${route.name}-${JSON.stringify(route.params ?? {})}-${browserSignup ? 'browser' : 'phone'}`;

  return (
    <>
      <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex min-h-0 flex-1 flex-col bg-canvas">
        {browserSignup ?
        <div className="flex flex-1 flex-col justify-center bg-surface px-6 py-10">
          <h1 className="text-xl font-semibold text-ink">Sign-up is open in the browser</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">Create the organisation in the browser beside this phone. The same steps stay available here if you would rather type on the phone.</p>
          <Button full className="mt-6" onClick={() => dispatch({ type: 'EMPLOYEE_NAV', route: { name: 'signin' } })}>Continue on this phone</Button>
        </div> :
        <Screen />}
      </motion.div>
      {showNav && <BottomNav />}
      <ToastHost app="employer" />
    </>);

}