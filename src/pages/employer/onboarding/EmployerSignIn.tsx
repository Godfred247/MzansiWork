import { useState } from 'react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Button } from '../../../components/shared/Button';
import { Field } from '../../../components/shared/Field';
import { TextInput } from '../../../components/shared/TextInput';
import { ApiError, api, openWorkspace, saveToken } from '../../../api/client';
import { useDemo } from '../../../contexts/DemoStore';

export function EmployerSignIn() {
  const { dispatch } = useDemo();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <>
      <MobileHeader title="Sign in" />
      <ScreenBody className="bg-surface">
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!pw) return setError('Enter your password.');
            setLoading(true);
            setError('');
            void (async () => {
              try {
                const signed = await api<{ token: string; user: { role: string } }>('/api/auth/login', { body: { email, password: pw } });
                if (signed.user.role === 'employee') {
                  setError('This account is an employee. Sign in on the employee browser.');
                  return;
                }
                saveToken('employer', signed.token);
                const workspace = await openWorkspace(signed.token);
                dispatch({ type: 'ENTER_WORKSPACE', app: 'employer', workspace });
              } catch (caught) {
                setError(caught instanceof ApiError ? caught.message : 'Sign-in failed.');
              } finally {
                setLoading(false);
              }
            })();
          }}>
          <Field label="Work email" htmlFor="er-email"><TextInput id="er-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
          <Field label="Password" htmlFor="er-pw" error={error}>
            <TextInput id="er-pw" type="password" value={pw} invalid={!!error} onChange={(e) => {setPw(e.target.value);setError('');}} autoComplete="current-password" />
          </Field>
          <Button type="submit" full size="lg" loading={loading}>Sign in</Button>
        </form>
        <button onClick={() => dispatch({ type: 'EMPLOYER_PUSH', route: { name: 'forgot' } })} className="text-[13px] font-medium text-primary">Forgot password?</button>
      </ScreenBody>
    </>);

}
