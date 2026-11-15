import { useEffect, useState } from 'react';
import { FileTextIcon, Loader2Icon, PaperclipIcon, XIcon } from 'lucide-react';
import { ApiError, readToken } from '../../api/client';
import { submitLeaveRequest } from '../../api/leave';
import { useDemo } from '../../contexts/DemoStore';
import { actorId, actorMember } from '../../utils/selectors';
import { leaveTypeLabels } from '../../data/statusLabels';
import type { LeaveType } from '../../types/time';
import { leaveBreakdown, overlaps } from '../../utils/leave';
import { labelLeave, shownBalances } from '../../utils/leavePolicy';
import { fmtDate } from '../../utils/time';
import { isLiveOrg } from '../../utils/workspace';
import { Banner } from '../shared/Banner';
import { Button } from '../shared/Button';
import { Dialog } from '../shared/Dialog';
import { Field } from '../shared/Field';
import { SelectInput } from '../shared/SelectInput';
import { TextArea } from '../shared/TextArea';
import { TextInput } from '../shared/TextInput';

const types: LeaveType[] = ['annual', 'sick', 'family', 'study', 'parental', 'unpaid'];

export function LeaveDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { state, dispatch } = useDemo();
  const [type, setType] = useState('annual');
  const [start, setStart] = useState('2026-11-11');
  const [end, setEnd] = useState('2026-11-13');
  const [portion, setPortion] = useState<'full' | 'morning' | 'afternoon'>('full');
  const [notes, setNotes] = useState('');
  const [contact, setContact] = useState('');
  const [doc, setDoc] = useState<'none' | 'uploading' | 'done'>('none');
  const [tried, setTried] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const livePolicy = isLiveOrg(state.orgId) && !state.flow && state.leavePolicies.length > 0;
  const choices = livePolicy
    ? state.leavePolicies.filter((policy) => policy.enabled).map((policy) => ({ value: policy.code, label: policy.name }))
    : types.map((item) => ({ value: item, label: leaveTypeLabels[item] }));

  useEffect(() => {
    if (open) {setTried(false);setDoc('none');}
  }, [open]);

  const single = start === end;
  const b = leaveBreakdown(start, end, single ? portion : 'full');
  const bal = shownBalances(state, actorId(state)).find((item) => item.code === type);
  const own = state.leave.filter((l) => l.memberId === actorId(state) && (l.status === 'approved' || l.status === 'pending') && overlaps(l, { start, end }));
  const designIds = state.members.filter((m) => m.department === actorMember(state)?.department && m.id !== actorId(state)).map((m) => m.id);
  const team = state.leave.filter((l) => designIds.includes(l.memberId) && l.status === 'approved' && overlaps(l, { start, end }));
  const docSuggested = type === 'sick' && (b?.working ?? 0) > 2;
  const errors = {
    dates: !b ? 'End date must be on or after the start date.' : start < '2026-10-26' ? 'Choose today or a future date. For past absences, ask your manager.' : b.working === 0 ? 'These dates contain no working days.' : '',
    balance: bal && bal.available !== null && b && b.working > bal.available ? `You have ${bal.available} days available.` : '',
    overlap: own.length ? 'You already have leave on some of these dates.' : ''
  };
  const valid = !errors.dates && !errors.balance && !errors.overlap;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Request leave"
      description="Your manager reviews the request. Leave rules are configured by your employer."
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
          loading={saving}
          onClick={() => {
            setTried(true);
            if (!valid || !b) return;
            const payload = { type, start, end, days: b.working, portion: single ? portion : 'full' as const, notes, contact: contact || undefined, document: doc === 'done' ? 'supporting-document.pdf' : undefined };
            if (isLiveOrg(state.orgId) && !state.flow) {
              const token = readToken('employee');
              if (!token) {
                setSubmitError('Sign in again before sending this request.');
                return;
              }
              setSaving(true);
              void submitLeaveRequest(token, { leaveType: type, start, end, days: b.working, notes }).then((row) => {
                dispatch({ type: 'SUBMIT_LEAVE', id: row.id, payload });
                onClose();
              }).catch((caught: unknown) => {
                setSubmitError(caught instanceof ApiError ? caught.message : 'The request was not saved.');
              }).finally(() => setSaving(false));
              return;
            }
            dispatch({ type: 'SUBMIT_LEAVE', payload });
            onClose();
          }}>
          
            Submit request
          </Button>
        </>
      }>
      
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Leave type" htmlFor="lv-type" hint={bal ? bal.available === null ? bal.note : `${bal.available} days available` : undefined}>
            <SelectInput id="lv-type" value={type} onChange={(e) => setType(e.target.value)} options={choices.length ? choices : [{ value: '', label: 'No leave types yet' }]} />
          </Field>
          {single &&
          <Field label="Portion of day" htmlFor="lv-portion">
              <SelectInput id="lv-portion" value={portion} onChange={(e) => setPortion(e.target.value as 'full')} options={[{ value: 'full', label: 'Full day' }, { value: 'morning', label: 'Morning (half day)' }, { value: 'afternoon', label: 'Afternoon (half day)' }]} />
            </Field>
          }
          <Field label="Start date" htmlFor="lv-start" error={tried ? errors.dates : ''}>
            <TextInput id="lv-start" type="date" value={start} min="2026-10-26" invalid={tried && !!errors.dates} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="End date" htmlFor="lv-end">
            <TextInput id="lv-end" type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>

        {b &&
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-hover p-3 text-center">
            <div><p className="tnum text-lg font-semibold text-ink">{b.working}</p><p className="text-xs text-muted">working day{b.working === 1 ? '' : 's'} requested</p></div>
            <div><p className="tnum text-lg font-semibold text-ink">{b.weekends}</p><p className="text-xs text-muted">weekend days excluded</p></div>
            <div><p className="tnum text-lg font-semibold text-ink">{b.holidays.length}</p><p className="text-xs text-muted">public holidays excluded</p></div>
          </div>
        }
        {b && b.holidays.length > 0 && <p className="text-xs text-muted">Public holidays not counted: {b.holidays.map((h) => `${h.name} (${fmtDate(h.date, 'd MMM')})`).join(', ')}.</p>}
        {tried && errors.balance && <Banner tone="danger" title="Not enough balance">{errors.balance} Choose fewer days or a different leave type.</Banner>}
        {errors.overlap && <Banner tone="warning" title="Overlapping leave">{own.map((l) => `${labelLeave(state.leavePolicies, l.type)} ${fmtDate(l.start, 'd MMM')}–${fmtDate(l.end, 'd MMM')} (${l.status})`).join(', ')}</Banner>}
        {submitError && <Banner tone="danger" title="Request not saved">{submitError}</Banner>}
        {livePolicy && choices.length === 0 && <Banner tone="warning" title="No leave types are switched on">Ask the owner to set the leave policy before you request leave.</Banner>}
        {team.length > 0 && <Banner tone="info" title="A teammate is also away">{team.length} person in {actorMember(state)?.department ?? 'the team'} has approved leave during these dates. Your manager will see this when reviewing.</Banner>}
        {type === 'parental' && <Banner tone="warning" title="Eligibility awaiting HR verification">Parental leave rules have changed recently. HR will confirm your entitlement — submitting doesn’t guarantee eligibility.</Banner>}

        <Field label="Notes for your manager" htmlFor="lv-notes" optional hint="Please don’t include medical details — they aren’t needed.">
          <TextArea id="lv-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[64px]" />
        </Field>

        {(docSuggested || type === 'family') &&
        <div className="rounded-xl border border-line p-3.5">
            <p className="text-[13px] font-medium text-ink">Supporting document</p>
            <p className="mt-0.5 text-xs text-muted">Your company policy may require a document for this request. PDF, JPG or PNG up to 5 MB. You can also add it later.</p>
            {doc === 'none' &&
          <Button size="sm" variant="secondary" className="mt-2.5" icon={<PaperclipIcon className="h-3.5 w-3.5" />} onClick={() => {setDoc('uploading');window.setTimeout(() => setDoc('done'), 1000);}}>Attach file</Button>
          }
            {doc === 'uploading' && <p className="mt-2.5 flex items-center gap-2 text-xs text-muted"><Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden />Uploading and scanning…</p>}
            {doc === 'done' &&
          <p className="mt-2.5 flex items-center gap-2 text-xs text-ink">
                <FileTextIcon className="h-3.5 w-3.5 text-success" aria-hidden />supporting-document.pdf · scanned, safe
                <button aria-label="Remove file" onClick={() => setDoc('none')} className="rounded p-0.5 text-muted hover:bg-hover"><XIcon className="h-3.5 w-3.5" /></button>
              </p>
          }
          </div>
        }

        {type === 'annual' && (b?.working ?? 0) >= 3 &&
        <Field label="Contact details while away" htmlFor="lv-contact" optional hint="Only if your company policy asks for it.">
            <TextInput id="lv-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. Email only for urgent client issues" />
          </Field>
        }
      </div>
    </Dialog>);

}