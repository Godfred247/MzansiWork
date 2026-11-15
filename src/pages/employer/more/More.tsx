import React, { useState } from 'react';
import {
  Building2Icon,
  ClipboardListIcon,
  DownloadIcon,
  FolderKanbanIcon,
  RadioIcon,
  HelpCircleIcon,
  MailIcon,
  LogOutIcon,
  PlaneIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldIcon,
  UserRoundIcon,
  WalletIcon
} from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { RowIcon } from '../../../components/employer/RowIcon';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Button } from '../../../components/shared/Button';
import { Dialog } from '../../../components/shared/Dialog';
import { clearToken } from '../../../api/client';
import { useDemo } from '../../../contexts/DemoStore';
import { signedInName, viewerRoleLabel } from '../../../utils/permissions';
import type { EmployerScreen } from '../../../types/nav';

const groups: {title: string;items: {screen: EmployerScreen;title: string;subtitle: string;icon: React.ElementType;tone?: 'primary' | 'teal' | 'navy' | 'warning';}[];}[] = [
{
  title: 'Work',
  items: [
  { screen: 'reports', title: 'Reports', subtitle: 'Attendance, timesheets, leave and exceptions', icon: ClipboardListIcon, tone: 'primary' },
  { screen: 'leave', title: 'Leave management', subtitle: 'Requests, balances and the days you allow', icon: PlaneIcon, tone: 'teal' },
  { screen: 'projects', title: 'Tasks and projects', subtitle: 'Where time is recorded', icon: FolderKanbanIcon, tone: 'navy' },
  { screen: 'exports', title: 'Export centre', subtitle: 'CSV, Excel and PDF downloads', icon: DownloadIcon },
  { screen: 'emails', title: 'Email templates', subtitle: 'Invitations, leave, billing and resets', icon: MailIcon, tone: 'teal' },
  { screen: 'live', title: 'Live workspace', subtitle: 'Seats, invites and files from the API', icon: RadioIcon, tone: 'navy' }]
},
{
  title: 'Organisation',
  items: [
  { screen: 'settings', title: 'Organisation settings', subtitle: 'Hours, time zone and branches', icon: Building2Icon },
  { screen: 'policy', title: 'Tracking policy', subtitle: 'What is collected, and when', icon: ShieldIcon, tone: 'teal' },
  { screen: 'roles', title: 'Roles and permissions', subtitle: 'Choose who approves timesheets and leave', icon: SettingsIcon },
  { screen: 'subscription', title: 'Subscription and billing', subtitle: 'Plan, seats and payment', icon: WalletIcon, tone: 'navy' },
  { screen: 'audit', title: 'Audit history', subtitle: 'Who changed what, and why', icon: ScrollTextIcon }]
},
{
  title: 'Account',
  items: [
  { screen: 'profile', title: 'Profile and security', subtitle: 'Password, sessions and sign-out', icon: UserRoundIcon },
  { screen: 'help', title: 'Help and support', subtitle: 'Guides and how to contact us', icon: HelpCircleIcon }]
}];

export function More() {
  const { state, dispatch } = useDemo();
  const [confirmOut, setConfirmOut] = useState(false);

  return (
    <>
      <MobileHeader large title="More" subtitle={`${signedInName(state)} · ${viewerRoleLabel(state.viewerRole)}`} />
      <ScreenBody className="pt-2">
        {groups.map((g) =>
        <MSection key={g.title} title={g.title}>
            {g.items.map((item) =>
          <MRow
            key={item.screen}
            leading={<RowIcon icon={item.icon} tone={item.tone ?? 'primary'} />}
            title={item.title}
            subtitle={item.subtitle}
            onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: item.screen } })} />
          )}
          </MSection>
        )}
        <MSection>
          <MRow
            leading={<RowIcon icon={LogOutIcon} tone="danger" />}
            title="Sign out"
            subtitle="You will need your password to sign in again"
            danger
            chevron={false}
            onClick={() => setConfirmOut(true)} />
        </MSection>
        <p className="px-1 text-center text-xs text-muted">Demo organisation · {state.org.name}</p>
      </ScreenBody>
      <Dialog
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        title="Sign out of MzansiWork?"
        description="Your organisation data stays on the server. This only ends this session."
        footer={
        <>
            <Button variant="secondary" onClick={() => setConfirmOut(false)}>Stay signed in</Button>
            <Button variant="danger" onClick={() => {clearToken('employer');dispatch({ type: 'EMPLOYER_SIGN_OUT' });}}>Sign out</Button>
          </>
        } />
    </>);
}
