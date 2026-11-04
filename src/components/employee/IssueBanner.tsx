import { useState } from 'react';
import { WifiOffIcon } from 'lucide-react';
import { useDemo } from '../../contexts/DemoStore';
import { Banner } from '../shared/Banner';
import { Button } from '../shared/Button';

export function IssueBanner() {
  const { state, dispatch } = useDemo();
  const [retrying, setRetrying] = useState(false);
  const issue = state.employeeIssue;
  if (!issue || issue === 'session_expired') return null;

  if (issue === 'offline') {
    return (
      <div className="px-4 pt-3">
        <Banner
          tone="warning"
          icon={WifiOffIcon}
          title="You’re offline"
          action={
          <Button
            size="sm"
            variant="secondary"
            loading={retrying}
            onClick={() => {
              setRetrying(true);
              window.setTimeout(() => {
                setRetrying(false);
                dispatch({ type: 'EMPLOYEE_ISSUE', issue: null });
                dispatch({ type: 'TOAST', app: 'employee', message: 'Back online. Nothing was lost.', tone: 'success' });
              }, 900);
            }}>
            
              Retry connection
            </Button>
          }>
          
          Clock and break buttons are paused so we don’t create a record the server hasn’t confirmed. Your last confirmed status is shown below.
        </Banner>
      </div>);

  }

  return (
    <div className="px-4 pt-3">
      <Banner
        tone="info"
        title="Already clocked in on another device"
        action={
        <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'EMPLOYEE_ISSUE', issue: null })}>
            Got it
          </Button>
        }>
        
        A clock-in from your iPhone at 07:59 was received while this page was open. We kept one session and did not create a duplicate. This page now shows the same session.
      </Banner>
    </div>);

}