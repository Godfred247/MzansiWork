import { useState } from 'react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { AccessDenied } from '../../../components/shared/AccessDenied';
import { Avatar } from '../../../components/shared/Avatar';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { SelectInput } from '../../../components/shared/SelectInput';
import { useDemo } from '../../../contexts/DemoStore';
import { accessLegend, capabilities, managerGrants, permissionMatrix, type Access } from '../../../data/permissions';
import type { Role } from '../../../types/org';
import { can, viewerRoleLabel } from '../../../utils/permissions';

const roleOptions: {value: Role;label: string;}[] = [
{ value: 'employee', label: 'Employee' },
{ value: 'approver', label: 'Delegated approver' },
{ value: 'manager', label: 'Manager' },
{ value: 'owner', label: 'Owner' }];

function ApproverPicker() {
  const { state, dispatch } = useDemo();
  const people = state.members.filter((member) => member.status === 'active');
  const subjects = people.filter((member) => member.role !== 'owner');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const subject = people.find((member) => member.id === subjectId);
  const [approverId, setApproverId] = useState(state.approverFor[subjectId] ?? '');
  const choices = people.filter((member) => member.id !== subjectId);
  const assigned = Object.entries(state.approverFor).flatMap(([memberId, chosenId]) => {
    const member = state.members.find((person) => person.id === memberId);
    const approver = state.members.find((person) => person.id === chosenId);
    return member && approver ? [{ member, approver }] : [];
  });

  const pickSubject = (id: string) => {
    setSubjectId(id);
    setApproverId(state.approverFor[id] ?? '');
  };

  if (subjects.length === 0) {
    return (
      <MSection title="Timesheet and leave approvers" footer="A manager is not chosen for you.">
        <MRow title="No one to assign yet" subtitle="Once people join, choose who may approve each person’s timesheets and leave." chevron={false} />
      </MSection>
    );
  }

  return (
    <MSection title="Timesheet and leave approvers" footer="This is not taken from someone’s job title or manager role. Leave it unset until you decide.">
      <div className="space-y-3 p-4">
        <SelectInput aria-label="Employee" value={subject?.id ?? ''} onChange={(event) => pickSubject(event.target.value)} options={subjects.map((member) => ({ value: member.id, label: member.name }))} />
        <SelectInput
          aria-label="Approver"
          value={choices.some((member) => member.id === approverId) ? approverId : ''}
          onChange={(event) => setApproverId(event.target.value)}
          options={[{ value: '', label: 'Not chosen' }, ...choices.map((member) => ({ value: member.id, label: `${member.name} · ${member.role}` }))]} />
        <Button
          full
          onClick={() => dispatch({ type: 'SET_APPROVER', memberId: subjectId, approverId: approverId || null })}>
          Save approver
        </Button>
      </div>
      {assigned.length === 0 ?
      <MRow title="No approver chosen yet" subtitle="Timesheets and leave stay with the owner until you pick someone." chevron={false} /> :
      assigned.map(({ member, approver }) =>
      <MRow key={member.id} title={member.name} subtitle={`Approved by ${approver.name}`} chevron={false} />
      )}
    </MSection>
  );
}

const accessTone: Record<Access, string> = {
  yes: 'text-success',
  scoped: 'text-info',
  own: 'text-muted',
  grant: 'text-warning',
  no: 'text-subtle'
};

export function RolesPermissions() {
  const { state, dispatch } = useDemo();
  const [memberId, setMemberId] = useState(state.members.find((m) => m.role === 'manager')?.id ?? state.members[0].id);
  const member = state.members.find((m) => m.id === memberId) ?? state.members[0];
  const [role, setRole] = useState<Role>(member.role);

  if (!can(state.viewerRole, 'manage_roles')) {
    return (
      <>
        <MobileHeader title="Roles" />
        <ScreenBody>
          <AccessDenied
            title="You cannot change roles"
            body="Role changes are limited to the account owner. A manager does not gain this by default, and nobody can read another person’s password."
            attempted="PATCH /api/organisations/mzansiwork/members/role"
            role={viewerRoleLabel(state.viewerRole)} />
        </ScreenBody>
      </>);
  }

  const pick = (id: string) => {
    setMemberId(id);
    const next = state.members.find((m) => m.id === id);
    if (next) setRole(next.role);
  };

  return (
    <>
      <MobileHeader title="Roles and permissions" />
      <ScreenBody>
        <Banner tone="info" title="Billing is never automatic">
          Making someone a manager does not let them change the plan, the card, or another person’s password. Billing stays with the owner unless you grant it explicitly.
        </Banner>
        <ApproverPicker />
        <MSection title="Change a role">
          <div className="space-y-3 p-4">
            <SelectInput aria-label="Person" value={member.id} onChange={(e) => pick(e.target.value)} options={state.members.filter((m) => m.status === 'active').map((m) => ({ value: m.id, label: `${m.name} · ${m.role}` }))} />
            <div className="flex items-center gap-3">
              <Avatar name={member.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{member.name}</p>
                <p className="truncate text-xs text-muted">{member.email}</p>
              </div>
            </div>
            <SelectInput aria-label="Role" value={role} disabled={member.role === 'owner'} onChange={(e) => setRole(e.target.value as Role)} options={roleOptions} />
            <Button
              full
              disabled={role === member.role || member.role === 'owner'}
              onClick={() => dispatch({ type: 'CHANGE_ROLE', id: member.id, role })}>
              Save role
            </Button>
            {member.role === 'owner' && <p className="text-xs text-muted">The subscription owner’s role is not changed from this screen.</p>}
          </div>
        </MSection>
        <MSection title="What each role can do" footer="Grant means the owner must turn it on. Pieter van Wyk currently has invite and export. He does not have billing.">
          {capabilities.map((cap) =>
          <div key={cap.id} className="px-4 py-3">
              <p className="text-sm font-medium text-ink">
                {cap.label}
                {managerGrants.includes(cap.id) && <span className="ml-2 text-[11px] font-normal text-warning">Granted to Pieter</span>}
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs">
                {(['owner', 'manager', 'approver', 'employee'] as Role[]).map((r) => {
                  const access = permissionMatrix[r][cap.id];
                  return <li key={r} className="flex justify-between gap-3"><span className="capitalize text-muted">{r}</span><span className={accessTone[access]}>{accessLegend[access]}</span></li>;
                })}
              </ul>
            </div>
          )}
        </MSection>
      </ScreenBody>
    </>);
}
