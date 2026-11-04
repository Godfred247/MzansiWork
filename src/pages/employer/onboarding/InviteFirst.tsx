import { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { StepProgress } from '../../../components/employer/StepProgress';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { SelectInput } from '../../../components/shared/SelectInput';
import { TextInput } from '../../../components/shared/TextInput';
import { signupDraft, updateSignupDraft } from '../../../api/signupDraft';
import { useDemo } from '../../../contexts/DemoStore';
import { departments } from '../../../data/members';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import type { PlanId } from '../../../types/billing';
import { getPlan, planLimit } from '../../../utils/pricing';

export function InviteFirst() {
  const { dispatch } = useDemo();
  const p = useEmployerParams();
  const planId = (p.planId ?? 'small') as PlanId;
  const limit = planLimit(planId);
  const [rows, setRows] = useState([{ email: '', role: 'employee', dept: 'Design' }]);
  const [tried, setTried] = useState(false);
  const filled = rows.filter((r) => r.email.trim());
  const used = 1 + filled.length;
  const invalid = filled.filter((r) => !/^\S+@\S+\.\S{2,}$/.test(r.email));
  const dupes = filled.filter((r, i) => filled.findIndex((x) => x.email.trim().toLowerCase() === r.email.trim().toLowerCase()) !== i);
  const over = used > limit;

  const remember = (list: typeof filled) => {
    updateSignupDraft({
      invites: list.map((r) => ({ email: r.email.trim().toLowerCase(), role: r.role, department: r.dept, branch: signupDraft().branches[0] ?? '' }))
    });
  };
  const next = () => {
    setTried(true);
    if (invalid.length || dupes.length || over) return;
    remember(filled);
    dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'done', params: { ...p, invites: filled.map((r) => r.email.trim().toLowerCase()).join(',') } } });
  };

  return (
    <>
      <MobileHeader title="Invite your team" />
      <StepProgress step={4} total={4} label="Invite employees" />
      <ScreenBody className="pt-3">
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <p className="tnum text-[13px] text-ink"><strong>{used}</strong> of <strong>{limit}</strong> users on {getPlan(planId).name}</p>
          <p className="mt-0.5 text-xs text-muted">You (owner) count as 1. Each pending invitation reserves a seat until it’s accepted, cancelled or expires.</p>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-hover"><div className={`h-full ${over ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${Math.min(100, used / limit * 100)}%` }} /></div>
        </div>

        <ul className="space-y-3">
          {rows.map((r, i) =>
          <li key={i} className="space-y-2 rounded-2xl bg-surface p-3 shadow-card">
              <div className="flex gap-2">
                <TextInput aria-label={`Employee ${i + 1} email`} type="email" placeholder="name@company.co.za" value={r.email} invalid={tried && (invalid.includes(r) || dupes.includes(r))} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
                <Button variant="ghost" aria-label="Remove" onClick={() => setRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ email: '', role: 'employee', dept: 'Design' }])} icon={<Trash2Icon className="h-4 w-4 text-muted" />} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SelectInput aria-label="Role" value={r.role} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} options={[{ value: 'employee', label: 'Employee' }, { value: 'manager', label: 'Manager' }]} />
                <SelectInput aria-label="Department" value={r.dept} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, dept: e.target.value } : x))} options={departments.map((d) => ({ value: d, label: d }))} />
              </div>
            </li>
          )}
        </ul>
        <Button variant="secondary" full icon={<PlusIcon className="h-4 w-4" />} disabled={used >= limit} onClick={() => setRows([...rows, { email: '', role: 'employee', dept: 'Design' }])}>Add another</Button>

        {tried && invalid.length > 0 && <Banner tone="danger" title="Check the email addresses">{invalid.length} address{invalid.length > 1 ? 'es are' : ' is'} not valid.</Banner>}
        {tried && dupes.length > 0 && <Banner tone="warning" title="Duplicate email">Each person only needs one invitation — duplicates never use extra seats.</Banner>}
        {over && <Banner tone="danger" title="More people than your plan allows">Remove some invitations or go back and choose a larger plan. We never upgrade automatically.</Banner>}
        <p className="px-1 text-xs text-muted">Manager invitations don’t include billing access — only the owner manages billing.</p>

        <div className="space-y-2">
          <Button full size="lg" onClick={next}>{filled.length ? `Send ${filled.length} invitation${filled.length > 1 ? 's' : ''}` : 'Continue'}</Button>
          <Button full variant="ghost" onClick={() => {remember([]);dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'done', params: { ...p, invites: '' } } });}}>Skip for now</Button>
        </div>
      </ScreenBody>
    </>);

}