import { useState } from 'react';
import { MailIcon, SearchIcon, SlidersHorizontalIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Avatar } from '../../../components/shared/Avatar';
import { Button } from '../../../components/shared/Button';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Field } from '../../../components/shared/Field';
import { IconButton } from '../../../components/shared/IconButton';
import { Segmented } from '../../../components/shared/Segmented';
import { SelectInput } from '../../../components/shared/SelectInput';
import { Sheet } from '../../../components/shared/Sheet';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { TextInput } from '../../../components/shared/TextInput';
import { useClock, useDemo } from '../../../contexts/DemoStore';
import { departments } from '../../../data/members';
import { attendanceLabels, inviteLabels } from '../../../data/statusLabels';
import type { Invitation } from '../../../types/org';
import { can, inScope } from '../../../utils/permissions';
import { liveMembers } from '../../../utils/selectors';
import { seatUsage } from '../../../utils/seats';
import { fmtDate } from '../../../utils/time';

const roleLabel = { owner: 'Owner', manager: 'Manager', approver: 'Approver', employee: 'Employee' };

export function Employees() {
  const { state, dispatch } = useDemo();
  const clock = useClock();
  const role = state.viewerRole;
  const [tab, setTab] = useState<'members' | 'invites'>('members');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('active');
  const [dept, setDept] = useState('all');
  const [roleF, setRoleF] = useState('all');
  const [inviteF, setInviteF] = useState('all');
  const [sheet, setSheet] = useState(false);
  const [inv, setInv] = useState<Invitation | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const usage = seatUsage(state);

  const list = liveMembers(state, clock, true).filter((m) => inScope(role, m.id)).filter((m) =>
  (status === 'all' || m.status === status) && (dept === 'all' || m.department === dept) && (roleF === 'all' || m.role === roleF) && (!q || `${m.name} ${m.email}`.toLowerCase().includes(q.toLowerCase()))
  );
  const invites = state.invitations.filter((i) => (inviteF === 'all' || i.status === inviteF) && (!q || i.email.includes(q.toLowerCase())));
  const liveInv = inv ? state.invitations.find((i) => i.id === inv.id) ?? null : null;

  return (
    <>
      <MobileHeader
        large
        title="Employees"
        actions={
        <>
            <IconButton label="Filters" onClick={() => setSheet(true)}><SlidersHorizontalIcon className="h-5 w-5" /></IconButton>
            {can(role, 'invite') && <IconButton label="Invite employee" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'invite' } })}><UserPlusIcon className="h-5 w-5 text-primary" /></IconButton>}
          </>
        } />
      
      <ScreenBody className="space-y-4 pt-2">
        {role !== 'approver' &&
        <button onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'seats' } })} className="flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3 text-left shadow-card">
            <span>
              <span className="tnum block text-sm font-semibold text-ink">{usage.used} of {usage.limit} seats used</span>
              <span className="tnum block text-xs text-muted">{usage.active} active · {usage.reserved} reserved by invitations</span>
            </span>
            <StatusBadge tone={usage.available ? 'success' : 'danger'} label={`${usage.available} available`} />
          </button>
        }
        <Segmented full label="List" value={tab} onChange={setTab} options={[{ value: 'members', label: 'Members' }, { value: 'invites', label: 'Invitations', count: state.invitations.filter((i) => i.status === 'pending').length }]} />
        <TextInput aria-label="Search" placeholder={tab === 'members' ? 'Search name or email' : 'Search invitations'} value={q} onChange={(e) => setQ(e.target.value)} leading={<SearchIcon className="h-4 w-4" />} />

        {tab === 'members' ?
        list.length === 0 ?
        <EmptyState icon={UsersIcon} title="No employees found" body="Adjust your search or filters." /> :

        <MSection footer={status === 'active' ? 'Showing active members. Inactive members keep all historical records.' : undefined}>
              {list.map((m) =>
          <MRow
            key={m.id}
            leading={<Avatar name={m.name} size="sm" />}
            title={<span className="flex items-center gap-1.5">{m.name}{m.role !== 'employee' && <span className="rounded bg-navy-50 px-1.5 text-[10px] font-semibold text-navy">{roleLabel[m.role]}</span>}</span>}
            subtitle={`${m.title} · ${m.department}`}
            trailing={m.status === 'inactive' ? <StatusBadge tone="neutral" label="Inactive" /> : <StatusBadge tone={attendanceLabels[m.attendance].tone} label={attendanceLabels[m.attendance].label} />}
            onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'employee', params: { id: m.id } } })} />

          )}
            </MSection> :

        invites.length === 0 ?
        <EmptyState icon={MailIcon} title="No invitations" body="Invite employees to join your organisation. Each pending invitation reserves a seat." action={can(role, 'invite') ? <Button size="sm" onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'invite' } })}>Invite employee</Button> : undefined} /> :

        <MSection footer="Expired and cancelled invitations release their seat automatically.">
            {invites.map((i) =>
          <MRow key={i.id} leading={<Avatar name={i.email} size="sm" />} title={i.acceptedName ?? i.email} subtitle={`${i.department} · ${i.status === 'pending' ? `expires ${fmtDate(i.expiresAt, 'd MMM')}` : `sent ${fmtDate(i.sentAt, 'd MMM')}`}`} trailing={<StatusBadge tone={inviteLabels[i.status].tone} label={inviteLabels[i.status].label} />} onClick={can(role, 'invite') ? () => setInv(i) : undefined} />
          )}
          </MSection>
        }
      </ScreenBody>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Filters" footer={<Button full onClick={() => setSheet(false)}>Apply</Button>}>
        <div className="space-y-4">
          {tab === 'members' ?
          <>
              <Field label="Employment status" htmlFor="ef-s"><SelectInput id="ef-s" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'all', label: 'All' }]} /></Field>
              <Field label="Role" htmlFor="ef-r"><SelectInput id="ef-r" value={roleF} onChange={(e) => setRoleF(e.target.value)} options={[{ value: 'all', label: 'All roles' }, { value: 'owner', label: 'Owner' }, { value: 'manager', label: 'Manager' }, { value: 'approver', label: 'Approver' }, { value: 'employee', label: 'Employee' }]} /></Field>
              <Field label="Department" htmlFor="ef-d"><SelectInput id="ef-d" value={dept} onChange={(e) => setDept(e.target.value)} options={[{ value: 'all', label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} /></Field>
            </> :

          <Field label="Invitation status" htmlFor="ef-i"><SelectInput id="ef-i" value={inviteF} onChange={(e) => setInviteF(e.target.value)} options={[{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'expired', label: 'Expired' }, { value: 'accepted', label: 'Accepted' }, { value: 'cancelled', label: 'Cancelled' }]} /></Field>
          }
        </div>
      </Sheet>

      <Sheet open={!!liveInv && !confirmCancel} onClose={() => setInv(null)} title={liveInv?.email ?? ''} description={liveInv ? `${inviteLabels[liveInv.status].label} · invited by ${liveInv.invitedBy} on ${fmtDate(liveInv.sentAt, 'd MMM')}` : ''}>
        {liveInv &&
        <div className="space-y-2 pb-2">
            {(liveInv.status === 'pending' || liveInv.status === 'expired' || liveInv.status === 'failed') &&
          <Button full variant="secondary" onClick={() => {dispatch({ type: 'RESEND_INVITE', id: liveInv.id });setInv(null);}}>{liveInv.status === 'pending' ? 'Resend invitation' : 'Send again (reserves a seat)'}</Button>
          }
            {liveInv.status === 'pending' && <Button full variant="danger" onClick={() => setConfirmCancel(true)}>Cancel invitation</Button>}
            {liveInv.status === 'accepted' && <p className="text-sm text-muted">Accepted by {liveInv.acceptedName}. They now occupy an active seat.</p>}
            {liveInv.status === 'cancelled' && <p className="text-sm text-muted">Cancelled — the seat was released.</p>}
          </div>
        }
      </Sheet>

      <Sheet open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel this invitation?" description="The link stops working and 1 seat is released. You can invite this person again later." footer={
      <div className="flex gap-2"><Button full variant="secondary" onClick={() => setConfirmCancel(false)}>Keep</Button><Button full variant="danger" onClick={() => {if (liveInv) dispatch({ type: 'CANCEL_INVITE', id: liveInv.id });setConfirmCancel(false);setInv(null);}}>Cancel invitation</Button></div>
      }>
        <p className="text-sm text-ink">{liveInv?.email}</p>
      </Sheet>
    </>);

}