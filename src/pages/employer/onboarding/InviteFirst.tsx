import { useEffect, useMemo, useRef, useState } from 'react';
import { XIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { StepProgress } from '../../../components/employer/StepProgress';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { ComboInput } from '../../../components/shared/ComboInput';
import { SelectInput } from '../../../components/shared/SelectInput';
import { TextInput } from '../../../components/shared/TextInput';
import { signupDraft, updateSignupDraft } from '../../../api/signupDraft';
import { useDemo } from '../../../contexts/DemoStore';
import { departments } from '../../../data/members';
import { useEmployerParams } from '../../../hooks/useEmployerParams';
import type { PlanId } from '../../../types/billing';
import { applyDomain, sharedDomain } from '../../../utils/emailDomain';
import { getPlan, planLimit } from '../../../utils/pricing';

interface InviteRow {
  id: string;
  email: string;
  role: string;
  title: string;
}

const emailOk = (email: string) => /^\S+@\S+\.\S{2,}$/.test(email);
const blank = (): InviteRow => ({ id: crypto.randomUUID(), email: '', role: 'employee', title: '' });
const roleLabel = (role: string) => role === 'manager' ? 'Manager' : 'Employee';

export function InviteFirst() {
  const { dispatch } = useDemo();
  const p = useEmployerParams();
  const planId = (p.planId ?? 'small') as PlanId;
  const limit = planLimit(planId);
  const [titles, setTitles] = useState(departments);
  const [saved, setSaved] = useState<InviteRow[]>([]);
  const [draft, setDraft] = useState<InviteRow>(blank);
  const [editing, setEditing] = useState(false);
  const [tried, setTried] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const selectDomain = useRef(false);
  const domain = useMemo(() => sharedDomain(saved.map((row) => row.email)), [saved]);

  useEffect(() => {
    if (!selectDomain.current) return;
    selectDomain.current = false;
    const field = emailRef.current;
    if (!field) return;
    const at = field.value.lastIndexOf('@');
    if (at >= 0) field.setSelectionRange(at + 1, field.value.length);
  }, [draft.email]);

  const pending = draft.email.trim();
  const queue = pending ? [...saved.filter((row) => row.id !== draft.id), { ...draft, email: draft.email.trim().toLowerCase() }] : saved;
  const used = 1 + queue.length;
  const over = used > limit;
  const draftInvalid = tried && !!pending && !emailOk(draft.email.trim());
  const draftDuplicate = !!pending && saved.some((row) => row.id !== draft.id && row.email === draft.email.trim().toLowerCase());

  const rememberTitle = (title: string) => {
    const clean = title.trim();
    if (!clean) return;
    setTitles((list) => list.some((item) => item.toLowerCase() === clean.toLowerCase()) ? list : [...list, clean]);
  };

  const remember = (list: InviteRow[]) => {
    updateSignupDraft({
      invites: list.map((row) => ({
        email: row.email.trim().toLowerCase(),
        role: row.role,
        department: row.title.trim(),
        branch: signupDraft().branches[0] ?? ''
      }))
    });
  };

  const problems = (list: InviteRow[]) => {
    const invalid = list.filter((row) => !emailOk(row.email.trim()));
    const dupes = list.filter((row, index) => list.findIndex((item) => item.email.trim().toLowerCase() === row.email.trim().toLowerCase()) !== index);
    return { invalid, dupes };
  };

  const commit = () => {
    const email = draft.email.trim().toLowerCase();
    if (!email) return false;
    if (!emailOk(email) || saved.some((row) => row.id !== draft.id && row.email === email) || over) {
      setTried(true);
      return false;
    }
    rememberTitle(draft.title);
    setSaved((list) => [...list.filter((row) => row.id !== draft.id), { ...draft, email, title: draft.title.trim() }]);
    setDraft(blank());
    setEditing(false);
    setTried(false);
    return true;
  };

  const edit = (row: InviteRow) => {
    if (pending && !commit()) return;
    setSaved((list) => list.filter((item) => item.id !== row.id));
    setDraft(row);
    setEditing(true);
    setTried(false);
  };

  const next = () => {
    setTried(true);
    const list = pending ? [...saved.filter((row) => row.id !== draft.id), { ...draft, email: draft.email.trim().toLowerCase(), title: draft.title.trim() }] : saved;
    const { invalid, dupes } = problems(list);
    if (invalid.length || dupes.length || 1 + list.length > limit) return;
    if (pending) rememberTitle(draft.title);
    remember(list);
    dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'done', params: { ...p, invites: list.map((row) => row.email.trim().toLowerCase()).join(',') } } });
  };

  const onEmail = (value: string) => {
    const nextValue = applyDomain(draft.email, value, domain);
    if (nextValue !== value) selectDomain.current = true;
    setDraft({ ...draft, email: nextValue });
  };

  return (
    <>
      <MobileHeader title="Invite your team" />
      <StepProgress step={4} total={4} label="Invite employees" />
      <ScreenBody className="pt-3">
        <div className="sticky top-0 z-20 space-y-3 bg-canvas pb-1">
          <div className="rounded-2xl bg-surface p-4 shadow-card">
            <p className="tnum text-[13px] text-ink"><strong>{used}</strong> of <strong>{limit}</strong> users on {getPlan(planId).name}</p>
            <p className="mt-0.5 text-xs text-muted">You (owner) count as 1. Each pending invitation reserves a seat until it’s accepted, cancelled or expires.</p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-hover"><div className={`h-full ${over ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${Math.min(100, used / limit * 100)}%` }} /></div>
          </div>

          <div className="space-y-2 rounded-2xl bg-surface p-3 shadow-card">
            <p className="text-xs font-medium text-muted">{editing ? 'Editing this person' : 'Person to add'}</p>
            <TextInput ref={emailRef} aria-label="Work email" type="email" placeholder="name@company.co.za" autoComplete="off" value={draft.email} invalid={draftInvalid || (tried && draftDuplicate)} onChange={(event) => onEmail(event.target.value)} />
            {domain && <p className="text-xs text-muted">Press @ to fill @{domain}.</p>}
            <div className="grid grid-cols-2 gap-2">
              <SelectInput aria-label="Role" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} options={[{ value: 'employee', label: 'Employee' }, { value: 'manager', label: 'Manager' }]} />
              <ComboInput ariaLabel="Job title" placeholder="Job title" value={draft.title} options={titles} onChange={(title) => setDraft({ ...draft, title })} onCreate={rememberTitle} />
            </div>
            <Button full variant="secondary" size="sm" disabled={!pending || over} onClick={commit}>{editing ? 'Update person' : 'Add person'}</Button>
          </div>
        </div>

        {saved.length > 0 &&
        <ul className="space-y-2" aria-label="People to invite">
            {saved.map((row) =>
            <li key={row.id} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => edit(row)}>
                  <span className="block truncate text-sm font-medium text-ink">{row.email}</span>
                  <span className="block truncate text-xs text-muted">{roleLabel(row.role)}{row.title ? ` · ${row.title}` : ''}</span>
                </button>
                <button type="button" aria-label={`Remove ${row.email}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-hover hover:text-ink" onClick={() => setSaved((list) => list.filter((item) => item.id !== row.id))}>
                  <XIcon className="h-4 w-4" />
                </button>
              </li>
            )}
          </ul>
        }

        {draftInvalid && <Banner tone="danger" title="Check the email address">Enter a work email such as name@company.co.za.</Banner>}
        {tried && draftDuplicate && <Banner tone="warning" title="Duplicate email">Each person only needs one invitation — duplicates never use extra seats.</Banner>}
        {over && <Banner tone="danger" title="More people than your plan allows">Remove someone or go back and choose a larger plan. We never upgrade automatically.</Banner>}
        <p className="px-1 text-xs text-muted">Type a job title, or pick one. Manager invitations don’t include billing access — only the owner manages billing. Tap a person to edit them.</p>

        <div className="space-y-2">
          <Button full size="lg" onClick={next}>{queue.length ? `Send ${queue.length} invitation${queue.length > 1 ? 's' : ''}` : 'Continue'}</Button>
          <Button full variant="ghost" onClick={() => { remember([]); dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'done', params: { ...p, invites: '' } } }); }}>Skip for now</Button>
        </div>
      </ScreenBody>
    </>);
}
