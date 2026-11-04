import { useState } from 'react';
import { MailCheckIcon } from 'lucide-react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Button } from '../../../components/shared/Button';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Field } from '../../../components/shared/Field';
import { TextInput } from '../../../components/shared/TextInput';
import { api } from '../../../api/client';
import { useDemo } from '../../../contexts/DemoStore';

export function ForgotPassword() {
  const { dispatch } = useDemo();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <>
      <MobileHeader title="Reset password" />
      <ScreenBody className="bg-surface">
        {sent ?
        <EmptyState icon={MailCheckIcon} tone="success" title="Check your email" body="If an account exists for that address, a reset link valid for 30 minutes has been queued. We never reveal whether an account exists. No email is sent until SendGrid is configured." action={<Button variant="secondary" onClick={() => dispatch({ type: 'EMPLOYER_BACK' })}>Back</Button>} /> :

        <form className="space-y-4" noValidate onSubmit={(e) => {e.preventDefault();if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');void api('/api/auth/forgot-password', { body: { email } }).finally(() => setSent(true));}}>
            <p className="text-sm text-muted">Enter your work email and we’ll send a secure reset link. Nobody — including administrators/employer, can see your password.</p>
            <Field label="Work email" htmlFor="fp-email" error={error}><TextInput id="fp-email" type="email" value={email} invalid={!!error} onChange={(e) => {setEmail(e.target.value);setError('');}} /></Field>
            <Button type="submit" full size="lg">Send reset link</Button>
          </form>
        }
      </ScreenBody>
    </>);

}