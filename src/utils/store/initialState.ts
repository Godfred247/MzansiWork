import { invitations, members } from '../../data/members';
import { projects } from '../../data/projects';
import {
  seedAudit,
  seedBalances,
  seedCorrections,
  seedEvents,
  seedExports,
  seedIntervals,
  seedLeave,
  seedNotifications } from
'../../data/seedTime';
import type { DemoState } from '../../types/demo';

export const DEFAULT_CLOCK = 10 * 3600 + 30 * 60;

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export function createInitialState(): DemoState {
  const demo = createDemoState();
  return {
    ...demo,
    orgId: '',
    employeeMemberId: '',
    org: { ...demo.org, name: '', contact: '' },
    employerAuthed: false,
    employerStack: [{ name: 'welcome' }],
    employeeAuthed: false,
    employeeRoute: { name: 'signin' },
    viewerRole: 'owner',
    members: [],
    invitations: [],
    session: { state: 'clocked_out', category: 'General administration', submitted: false },
    intervals: [],
    events: [],
    corrections: [],
    daySubmissions: {},
    leave: [],
    leavePolicies: [],
    leaveOpenings: [],
    balances: [],
    projects: [],
    employeeWorkOptions: { projects: [], tasks: [], categories: [] },
    employeeWorkOptionsLoading: false,
    exports: [],
    audit: [],
    notifications: [],
    agent: { ...demo.agent, signedIn: false, screen: 'signin', queue: [], paused: false },
    toasts: [],
    feed: []
  };
}

export function createDemoState(): DemoState {
  return {
    orgId: '11111111-1111-1111-1111-111111111111',
    employeeMemberId: 'm-thandi',
    viewerMemberId: 'm-lerato',
    org: {
      name: 'Mzansi Work (Pty) Ltd',
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
      week: 'Monday – Friday',
      hours: '08:00 – 17:00',
      branches: ['Cape Town', 'Johannesburg'],
      contact: 'hello@mzansiwork.co.za · 021 555 0142'
    },
    viewerRole: 'owner',
    employerAuthed: true,
    employerStack: [{ name: 'dashboard' }],
    employeeAuthed: true,
    employeeRoute: { name: 'day' },
    employeeIssue: null,
    employeeViewport: 'fit',
    members: clone(members),
    approverFor: {},
    invitations: clone(invitations),
    session: {
      state: 'clocked_in',
      clockInSec: 8 * 3600 + 2 * 60,
      projectId: 'p-shoprite',
      taskId: 't-checkout',
      category: 'Client work',
      submitted: false,
      workIntervalId: 'iv-t26-w2'
    },
    intervals: clone(seedIntervals).map((interval) => ({ ...interval, seeded: true })),
    events: clone(seedEvents),
    corrections: clone(seedCorrections),
    daySubmissions: {
      '2026-10-19': 'approved',
      '2026-10-20': 'approved',
      '2026-10-21': 'approved',
      '2026-10-22': 'approved',
      '2026-10-23': 'submitted',
      '2026-10-26': 'open'
    },
    leave: clone(seedLeave),
    leavePolicies: [],
    leaveOpenings: [],
    balances: clone(seedBalances),
    projects: clone(projects),
    employeeWorkOptions: { projects: [], tasks: [], categories: [] },
    employeeWorkOptionsLoading: false,
    subscription: {
      planId: 'small',
      frequency: 'monthly',
      enterpriseUsers: 100,
      renewal: '2026-11-14',
      termStart: '2026-10-14',
      payment: 'paid',
      paymentMethod: 'Visa •••• 4821'
    },
    exports: clone(seedExports),
    audit: clone(seedAudit),
    notifications: clone(seedNotifications),
    agent: {
      firstRunDone: true,
      signedIn: true,
      screen: 'main',
      connection: 'online',
      queue: [],
      lastSyncSec: 10 * 3600 + 28 * 60,
      updateAvailable: false,
      notifications: true,
      paused: false,
      settingsTab: 'account'
    },
    toasts: [],
    feed: [
    { id: 'f-seed-1', time: '10:28', app: 'agent', text: 'Agent synchronised 4 events for Thandi' },
    { id: 'f-seed-2', time: '10:15', app: 'employer', text: 'Aisha Patel started a tea break' },
    { id: 'f-seed-3', time: '10:00', app: 'employee', text: 'Thandi ended tea break (15m)' }],

    flow: null,
    focus: null,
    view: 'canvas',
    docsSection: 'design-system'
  };
}