import { useState } from 'react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { TextArea } from '../../../components/shared/TextArea';
import { TextInput } from '../../../components/shared/TextInput';
import { useDemo } from '../../../contexts/DemoStore';
import { brand } from '../../../data/brand';

const faqs = [
{ q: 'Does idle time mean the employee was not working?', a: 'No. The desktop agent only records that the operating system saw no keyboard or mouse input. Meetings, calls and desk-side work can be explained and reviewed.' },
{ q: 'Can a manager see passwords?', a: 'No. Password recovery sends a reset link. Stored passwords are never shown.' },
{ q: 'What happens at the seat limit?', a: 'A new invitation is not sent. Pending invitations already reserve a seat. You can cancel one or confirm a paid upgrade. The plan never upgrades itself.' },
{ q: 'Are leave balances legal advice?', a: 'No. Types and balances are configurable. South African leave law must be verified before you rely on a figure for payroll.' }];

export function HelpSupport() {
  const { dispatch } = useDemo();
  const [topic, setTopic] = useState('Seat limits');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const send = () => {
    if (message.trim().length < 12) {
      setError('Describe the question in a sentence or two.');
      return;
    }
    dispatch({ type: 'AUDIT_LOG', category: 'security', action: 'Contacted support', target: topic, toast: 'Message noted. In production this would email support — nothing was sent.' });
    setMessage('');
    setError('');
  };

  return (
    <>
      <MobileHeader title="Help and support" />
      <ScreenBody>
        <Banner tone="info" title={brand.name}>{brand.tagline} Write to {brand.supportEmail}. There is no SMS channel.</Banner>
        <MSection title="Common questions">
          {faqs.map((f) =>
          <div key={f.q} className="px-4 py-3">
              <p className="text-sm font-medium text-ink">{f.q}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{f.a}</p>
            </div>
          )}
        </MSection>
        <MSection title="Contact support" footer="This form is simulated. It does not send an email.">
          <div className="space-y-3 p-4">
            <Field label="Topic" htmlFor="help-topic">
              <TextInput id="help-topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Field>
            <Field label="How can we help?" htmlFor="help-body" error={error}>
              <TextArea id="help-body" value={message} onChange={(e) => {setMessage(e.target.value);setError('');}} placeholder="What you expected, and what happened" />
            </Field>
            <Button full onClick={send}>Submit question</Button>
          </div>
        </MSection>
      </ScreenBody>
    </>);
}
