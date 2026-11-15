import { leaveTypeName } from '../../data/statusLabels';
import { THANDI_ID } from '../../data/members';
import type { StampedAction } from '../../types/actions';
import type { DemoState } from '../../types/demo';
import { labelLeave } from '../leavePolicy';
import { TODAY, addDays, fmtDate, johannesburgNow, secToLabel } from '../time';
import { isLiveOrg } from '../workspace';
import { viewerName } from '../permissions';
import { getPlan, planLimit, planRank, priceFor, fmtZAR } from '../pricing';
import { checkInvite, seatUsage } from '../seats';
import { addAudit, addFeed, addToast, notify, uid } from './helpers';

export function orgReducer(s: DemoState, a: StampedAction): DemoState | null {
  const now = a.now;
  const actor = viewerName(s.viewerRole);
  const leaveName = (type: string) => labelLeave(s.leavePolicies, type) || leaveTypeName(type);
  switch (a.type) {
    case 'SET_LEAVE_SETUP':{
        const incoming = a.requests;
        const leave = incoming ? [...s.leave.filter((item) => !incoming.some((row) => row.id === item.id)), ...incoming] : s.leave;
        const openings = a.replaceOpenings === false
          ? [...s.leaveOpenings.filter((opening) => !a.openings.some((row) => row.policyId === opening.policyId && row.userId === opening.userId)), ...a.openings]
          : a.openings;
        return { ...s, leavePolicies: a.policies, leaveOpenings: openings, leave };
      }
    case 'SEND_INVITE':{
        const check = checkInvite(a.email, s);
        if (!check.ok) return addToast(s, 'employer', check.message, 'danger');
        const id = uid('inv');
        let n: DemoState = {
          ...s,
          lastInviteId: id,
          invitations: [
          { id, email: a.email.trim().toLowerCase(), role: a.role, department: a.department, branch: a.branch, status: 'pending', sentAt: TODAY, expiresAt: addDays(TODAY, 7), invitedBy: actor },
          ...s.invitations]

        };
        n = addAudit(n, { actor, action: 'Sent invitation', target: a.email, category: 'invitation' }, now);
        n = addFeed(n, 'employer', `Invitation to ${a.email} simulated → 1 seat reserved`, now);
        return addToast(n, 'employer', 'Invitation sent (simulated — no email delivered in this demo). 1 seat reserved.', 'success');
      }
    case 'INVITE_BLOCKED':
      return addFeed(s, 'employer', `Invitation to ${a.email} blocked — no seats available. Nothing was sent or charged.`, now);
    case 'RESEND_INVITE':{
        const inv = s.invitations.find((i) => i.id === a.id);
        if (!inv) return s;
        if (inv.status !== 'pending' && seatUsage(s).available <= 0) return addToast(s, 'employer', 'No seats available to re-reserve for this invitation.', 'danger');
        let n: DemoState = { ...s, invitations: s.invitations.map((i) => i.id === a.id ? { ...i, status: 'pending', sentAt: TODAY, expiresAt: addDays(TODAY, 7) } : i) };
        n = addAudit(n, { actor, action: 'Resent invitation', target: inv.email, category: 'invitation' }, now);
        return addToast(n, 'employer', 'Invitation resent (simulated). Expires in 7 days.', 'success');
      }
    case 'CANCEL_INVITE':{
        const inv = s.invitations.find((i) => i.id === a.id);
        if (!inv) return s;
        let n: DemoState = { ...s, invitations: s.invitations.map((i) => i.id === a.id ? { ...i, status: 'cancelled' } : i) };
        n = addAudit(n, { actor, action: 'Cancelled invitation — seat released', target: inv.email, category: 'invitation' }, now);
        n = addFeed(n, 'employer', `Invitation to ${inv.email} cancelled → seat released`, now);
        return addToast(n, 'employer', 'Invitation cancelled. 1 seat released.', 'neutral');
      }
    case 'EXPIRE_INVITE':{
        const inv = s.invitations.find((i) => i.id === a.id);
        if (!inv) return s;
        let n: DemoState = { ...s, invitations: s.invitations.map((i) => i.id === a.id ? { ...i, status: 'expired' } : i) };
        n = addAudit(n, { actor: 'System', action: 'Invitation expired — seat released', target: inv.email, category: 'invitation' }, now);
        return addToast(n, 'employer', 'Invitation expired (simulated). Seat released.', 'neutral');
      }
    case 'ACCEPT_INVITE':{
        const inv = s.invitations.find((i) => i.id === a.id);
        if (!inv || inv.status !== 'pending') return addToast(s, 'employee', 'This invitation is no longer valid. Ask your employer to resend it.', 'danger');
        let n: DemoState = {
          ...s,
          invitations: s.invitations.map((i) => i.id === a.id ? { ...i, status: 'accepted', acceptedName: a.name } : i),
          members: [
          ...s.members,
          {
            id: uid('m'), name: a.name, email: inv.email, role: inv.role, title: 'New team member', department: inv.department, branch: inv.branch,
            schedule: { label: 'Standard office', start: '08:00', end: '17:00', days: 'Mon–Fri' }, status: 'active', startDate: TODAY,
            attendance: 'not_clocked_in', hoursToday: 0, unresolvedIdle: 0, usesAgent: false
          }]

        };
        n = notify(n, 'employer', `${a.name} accepted your invitation`, `${inv.email} joined ${s.org.name}.`, 'success', now);
        n = addAudit(n, { actor: a.name, action: 'Accepted invitation', target: inv.email, category: 'invitation' }, now);
        n = addFeed(n, 'employee', `${a.name} accepted → employer sees “Accepted”; seat moved from reserved to active`, now);
        return addToast(n, 'employer', `${a.name} joined the organisation`, 'success');
      }
    case 'DEACTIVATE_MEMBER':{
        const m = s.members.find((x) => x.id === a.id);
        if (!m) return s;
        let n: DemoState = { ...s, members: s.members.map((x) => x.id === a.id ? { ...x, status: 'inactive', deactivatedOn: TODAY, attendance: 'not_clocked_in' } : x) };
        n = addAudit(n, { actor, action: 'Deactivated employee', target: m.name, reason: a.reason, category: 'member' }, now);
        return addToast(n, 'employer', `${m.name} deactivated. History retained; 1 seat released.`, 'neutral');
      }
    case 'REACTIVATE_MEMBER':{
        const m = s.members.find((x) => x.id === a.id);
        if (!m) return s;
        if (seatUsage(s).available <= 0) return addToast(s, 'employer', 'No seats available. Free a seat or change plan to reactivate.', 'danger');
        let n: DemoState = { ...s, members: s.members.map((x) => x.id === a.id ? { ...x, status: 'active', deactivatedOn: undefined } : x) };
        n = addAudit(n, { actor, action: 'Reactivated employee', target: m.name, category: 'member' }, now);
        return addToast(n, 'employer', `${m.name} reactivated`, 'success');
      }
    case 'CHANGE_ROLE':{
        const m = s.members.find((x) => x.id === a.id);
        if (!m) return s;
        let n: DemoState = { ...s, members: s.members.map((x) => x.id === a.id ? { ...x, role: a.role } : x) };
        n = addAudit(n, { actor, action: `Changed role ${m.role} → ${a.role}`, target: m.name, category: 'role' }, now);
        return addToast(n, 'employer', 'Role updated. Billing access is never granted automatically.', 'success');
      }
    case 'SET_APPROVER':{
        const person = s.members.find((x) => x.id === a.memberId);
        if (!person || a.approverId === person.id) return s;
        const approverFor = { ...s.approverFor };
        if (a.approverId) approverFor[a.memberId] = a.approverId;
        else delete approverFor[a.memberId];
        const approver = a.approverId ? s.members.find((x) => x.id === a.approverId) : undefined;
        let n: DemoState = { ...s, approverFor };
        n = addAudit(n, {
          actor,
          action: approver ? `Chose ${approver.name} to approve timesheets and leave` : 'Cleared the timesheet and leave approver',
          target: person.name,
          category: 'role'
        }, now);
        return addToast(n, 'employer', approver ? `${approver.name} will approve ${person.name}.` : `No approver chosen for ${person.name}.`, 'success');
      }
    case 'CHANGE_PLAN':{
        const cur = s.subscription;
        const users = a.users ?? cur.enterpriseUsers;
        const isUp = planRank(a.planId) > planRank(cur.planId) || a.planId === 'enterprise' && cur.planId === 'enterprise' && users > cur.enterpriseUsers;
        const samePlan = a.planId === cur.planId && !(a.planId === 'enterprise' && users !== cur.enterpriseUsers);
        const price = fmtZAR(priceFor(a.planId, a.frequency, users));
        let n: DemoState;
        if (samePlan) return s;
        if (isUp) {
          const annualSwitch = a.frequency === 'annual' && cur.frequency !== 'annual';
          n = {
            ...s,
            subscription: {
              ...cur, planId: a.planId, frequency: a.frequency, enterpriseUsers: users,
              termStart: annualSwitch ? TODAY : cur.termStart, renewal: annualSwitch ? addDays(TODAY, 365) : cur.renewal,
              scheduledPlanId: undefined, scheduledEffective: undefined
            }
          };
          n = addToast(n, 'employer', `Upgraded to ${getPlan(a.planId).name} (simulated — no payment taken)`, 'success');
        } else {
          const lim = planLimit(a.planId, users);
          if (seatUsage(s).used > lim) return addToast(s, 'employer', 'Downgrade blocked: reduce members or pending invitations first.', 'danger');
          n = { ...s, subscription: { ...cur, scheduledPlanId: a.planId, scheduledFrequency: a.frequency, scheduledEffective: cur.renewal } };
          n = addToast(n, 'employer', `Downgrade to ${getPlan(a.planId).name} scheduled for ${fmtDate(cur.renewal, 'd MMM yyyy')}`, 'success');
        }
        n = addAudit(n, { actor, action: isUp ? 'Upgraded plan' : 'Scheduled downgrade', target: `${getPlan(cur.planId).name} → ${getPlan(a.planId).name} · ${a.frequency} · ${price}`, reason: 'Explicitly confirmed by owner', category: 'subscription' }, now);
        n = notify(n, 'employer', 'Plan change confirmation', `${getPlan(a.planId).name} · ${a.frequency} · ${price}. Confirmation email simulated.`, 'success', now);
        return addFeed(n, 'employer', `Owner confirmed plan change → ${getPlan(a.planId).name}`, now);
      }
    case 'SCHEDULE_FREQUENCY':{
        let n: DemoState = { ...s, subscription: { ...s.subscription, scheduledFrequency: a.frequency, scheduledEffective: s.subscription.renewal } };
        n = addAudit(n, { actor, action: `Scheduled billing change to ${a.frequency}`, target: `Effective ${fmtDate(s.subscription.renewal, 'd MMM yyyy')}`, reason: 'Explicitly confirmed by owner', category: 'subscription' }, now);
        return addToast(n, 'employer', `Billing changes to ${a.frequency} on ${fmtDate(s.subscription.renewal, 'd MMM yyyy')}`, 'success');
      }
    case 'CANCEL_SCHEDULED':{
        const n: DemoState = { ...s, subscription: { ...s.subscription, scheduledFrequency: undefined, scheduledPlanId: undefined, scheduledEffective: undefined } };
        return addToast(addAudit(n, { actor, action: 'Cancelled scheduled subscription change', target: getPlan(s.subscription.planId).name, category: 'subscription' }, now), 'employer', 'Scheduled change cancelled', 'neutral');
      }
    case 'PAYMENT_FAIL':{
        const amount = priceFor(s.subscription.planId, s.subscription.frequency, s.subscription.enterpriseUsers);
        let n: DemoState = { ...s, subscription: { ...s.subscription, payment: 'failed', failedOn: TODAY, amountDue: amount } };
        n = notify(n, 'employer', 'Payment failed', `${fmtZAR(amount)} could not be collected from ${s.subscription.paymentMethod}.`, 'danger', now);
        return addFeed(n, 'employer', 'Simulated: renewal payment failed', now);
      }
    case 'RETRY_PAYMENT':{
        if (!a.ok) return addToast(s, 'employer', 'Payment declined again (simulated). Update your payment method.', 'danger');
        let n: DemoState = { ...s, subscription: { ...s.subscription, payment: 'paid', failedOn: undefined, amountDue: undefined } };
        n = addAudit(n, { actor, action: 'Payment retried successfully', target: s.subscription.paymentMethod, category: 'subscription' }, now);
        return addToast(n, 'employer', 'Payment successful (simulated)', 'success');
      }
    case 'UPDATE_PAYMENT_METHOD':{
        const n: DemoState = { ...s, subscription: { ...s.subscription, paymentMethod: a.label } };
        return addToast(addAudit(n, { actor, action: 'Updated payment method', target: a.label, category: 'subscription' }, now), 'employer', 'Payment method updated', 'success');
      }
    case 'CANCEL_SUBSCRIPTION':{
        let n: DemoState = { ...s, subscription: { ...s.subscription, cancelEffective: s.subscription.renewal } };
        n = addAudit(n, { actor, action: 'Cancelled subscription', target: `Effective ${fmtDate(s.subscription.renewal, 'd MMM yyyy')}`, category: 'subscription' }, now);
        n = notify(n, 'employer', 'Subscription cancellation confirmed', `Access continues until ${fmtDate(s.subscription.renewal, 'd MMM yyyy')}.`, 'info', now);
        return addToast(n, 'employer', 'Cancellation scheduled. Access continues until the end of the paid period.', 'neutral');
      }
    case 'RESUME_SUBSCRIPTION':{
        const n: DemoState = { ...s, subscription: { ...s.subscription, cancelEffective: undefined } };
        return addToast(addAudit(n, { actor, action: 'Resumed subscription', target: getPlan(s.subscription.planId).name, category: 'subscription' }, now), 'employer', 'Subscription will renew as normal', 'success');
      }
    case 'EXPORT_START':{
        let n: DemoState = { ...s, exports: [{ id: a.id, report: a.report, format: a.format, range: a.range, dataType: a.dataType, status: 'running', date: TODAY, time: secToLabel(now), willFail: a.willFail }, ...s.exports] };
        n = addAudit(n, { actor, action: 'Started export', target: `${a.report} · ${a.range} (${a.dataType}, ${a.format})`, category: 'export' }, now);
        return n;
      }
    case 'EXPORT_DONE':{
        const n: DemoState = { ...s, exports: s.exports.map((x) => x.id === a.id ? { ...x, status: a.ok ? 'done' : 'failed', rows: a.ok ? 186 : undefined } : x) };
        return addToast(n, 'employer', a.ok ? 'Export ready to download' : 'Export failed — the report took too long. Try a shorter date range.', a.ok ? 'success' : 'danger');
      }
    case 'AUDIT_LOG':{
        let n = addAudit(s, { actor, action: a.action, target: a.target, reason: a.reason, category: a.category }, now);
        n = addFeed(n, 'employer', `${actor}: ${a.action} — ${a.target}`, now);
        return a.toast ? addToast(n, 'employer', a.toast, 'success') : n;
      }
    case 'ADD_PROJECT':{
        const n: DemoState = { ...s, projects: [...s.projects, a.project] };
        return addToast(addAudit(n, { actor, action: 'Created project', target: a.project.name, category: 'policy' }, now), 'employer', `Project “${a.project.name}” created`, 'success');
      }
    case 'ADD_TASK':{
        const n: DemoState = {
          ...s,
          projects: s.projects.map((p) => p.id === a.projectId ? { ...p, tasks: [...p.tasks, { id: uid('t'), name: a.name, assignees: [], billable: a.billable, status: 'open' }] } : p)
        };
        return addToast(n, 'employer', `Task “${a.name}” added`, 'success');
      }
    case 'SUBMIT_LEAVE':{
        const p = a.payload;
        const employeeId = s.employeeMemberId || THANDI_ID;
        const employeeName = s.members.find((m) => m.id === employeeId)?.name ?? 'Employee';
        const submitted = isLiveOrg(s.orgId) && !s.flow ? johannesburgNow().iso : TODAY;
        let n: DemoState = { ...s, leave: [{ id: a.id ?? uid('l'), memberId: employeeId, ...p, status: 'pending', submitted }, ...s.leave] };
        n = notify(n, 'employer', `Leave request from ${employeeName}`, `${leaveName(p.type)} · ${fmtDate(p.start, 'd MMM')}–${fmtDate(p.end, 'd MMM')} · ${p.days} day${p.days === 1 ? '' : 's'}`, 'warning', now);
        n = addAudit(n, { actor: employeeName, action: 'Submitted leave request', target: `${leaveName(p.type)} ${fmtDate(p.start, 'd MMM')}`, category: 'leave' }, now);
        n = addFeed(n, 'employee', `${employeeName.split(' ')[0]} requested leave → Approvals inbox +1 on employer app`, now);
        return addToast(n, 'employee', 'Leave request submitted', 'success');
      }
    case 'WITHDRAW_LEAVE':{
        const n: DemoState = { ...s, leave: s.leave.map((l) => l.id === a.id ? { ...l, status: 'withdrawn' } : l) };
        return addToast(addAudit(n, { actor: s.members.find((m) => m.id === (s.employeeMemberId || THANDI_ID))?.name ?? 'Employee', action: 'Withdrew leave request', target: a.id, category: 'leave' }, now), 'employee', 'Leave request withdrawn', 'neutral');
      }
    case 'REVIEW_LEAVE':{
        const l = s.leave.find((x) => x.id === a.id);
        if (!l) return s;
        let n: DemoState = { ...s, leave: s.leave.map((x) => x.id === a.id ? { ...x, status: a.decision, reviewer: actor, decisionReason: a.reason || undefined } : x) };
        if (a.decision === 'approved' && s.leavePolicies.length === 0 && l.memberId === (s.employeeMemberId || THANDI_ID)) {
          n = { ...n, balances: n.balances.map((b) => b.type === l.type && b.available !== null ? { ...b, available: b.available - l.days, used: b.used + l.days } : b) };
        }
        const m = s.members.find((x) => x.id === l.memberId);
        const verb = a.decision === 'approved' ? 'Approved' : a.decision === 'rejected' ? 'Rejected' : 'Requested more information on';
        n = addAudit(n, { actor, action: `${verb} leave`, target: `${m?.name} · ${leaveName(l.type)} ${fmtDate(l.start, 'd MMM')}`, reason: a.reason || undefined, category: 'leave' }, now);
        n = addFeed(n, 'employer', `${actor} ${verb.toLowerCase()} ${m?.name.split(' ')[0]}’s leave`, now);
        if (l.memberId === (s.employeeMemberId || THANDI_ID)) {
          const title = a.decision === 'approved' ? 'Leave approved' : a.decision === 'rejected' ? 'Leave not approved' : 'More information requested on leave';
          n = notify(n, 'employee', title, `${leaveName(l.type)} ${fmtDate(l.start, 'd MMM')}–${fmtDate(l.end, 'd MMM')}${a.reason ? ` — “${a.reason}”` : ''}`, a.decision === 'approved' ? 'success' : a.decision === 'rejected' ? 'danger' : 'info', now);
          n = addToast(n, 'employee', title, a.decision === 'approved' ? 'success' : a.decision === 'rejected' ? 'danger' : 'info');
        }
        return addToast(n, 'employer', `${verb} · employee notified`, 'success');
      }
  }
  return null;
}