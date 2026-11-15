import { useState } from 'react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MRow } from '../../../components/employer/MRow';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { Banner } from '../../../components/shared/Banner';
import { Button } from '../../../components/shared/Button';

const API = 'http://localhost:5080';

interface Seats {
  planId: string;
  limit: number;
  active: number;
  reserved: number;
  available: number;
}

interface Person {
  id: string;
  fullName: string;
  department: string;
  role: string;
}

interface QueuedEmail {
  id: string;
  toAddress: string;
  subject: string;
  status: string;
}

interface Snapshot {
  organisation: string;
  seats: Seats;
  people: Person[];
  emails: QueuedEmail[];
}

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return (body as { message?: string }).message ?? `The API returned ${response.status}.`;
}

export function LiveWorkspace() {
  const [token, setToken] = useState('');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const headers = (json = false): HeadersInit => ({
    Authorization: `Bearer ${token}`,
    ...(json ? { 'Content-Type': 'application/json' } : {})
  });

  const refresh = async (nextToken: string) => {
    const auth = { Authorization: `Bearer ${nextToken}` };
    const [home, emails] = await Promise.all([
      fetch(`${API}/api/dashboard`, { headers: auth }).then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return response.json();
      }),
      fetch(`${API}/api/emails`, { headers: auth }).then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return response.json() as Promise<QueuedEmail[]>;
      })
    ]);
    setSnapshot({
      organisation: home.organisation?.name ?? 'Organisation',
      seats: home.seats,
      people: home.people,
      emails
    });
  };

  const connect = async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'lerato@mzansiwork.co.za', password: 'Password123' })
      });
      if (!response.ok) throw new Error(await readError(response));
      const body = await response.json();
      setToken(body.token);
      await refresh(body.token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The API is not reachable.');
    } finally {
      setBusy(false);
    }
  };

  const invite = async () => {
    if (!token) return;
    setBusy(true);
    setMessage('');
    try {
      const email = `new.hire.${Date.now()}@mzansiwork.co.za`;
      const response = await fetch(`${API}/api/invitations`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ email, role: 'employee', department: 'Support', branch: 'Cape Town' })
      });
      if (!response.ok) throw new Error(await readError(response));
      setMessage(`Invitation queued for ${email}. One seat is reserved. No email was sent because SendGrid is not configured.`);
      await refresh(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The invitation was not sent.');
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!token) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`${API}/api/exports`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ report: 'Corrections', format: 'CSV', range: 'This month', dataType: 'approved and pending' })
      });
      if (!response.ok) throw new Error(await readError(response));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'corrections.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage('CSV downloaded from the API. The file includes the report name, data type and date range.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The export failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <MobileHeader title="Live workspace" subtitle="localhost:5080" />
      <ScreenBody>
        <Banner tone="info" title="This screen uses the API">
          The rest of the canvas keeps the guided demo. Here, seats, invitations and the file download come from the ASP.NET service. No card is charged.
        </Banner>
        {!snapshot ? (
          <Button full loading={busy} onClick={connect}>Sign in as Lerato</Button>
        ) : (
          <>
            <MSection title={snapshot.organisation} footer="Available seats = plan limit − active members − pending invitations.">
              <MRow title="Plan" subtitle={`${snapshot.seats.active} active · ${snapshot.seats.reserved} reserved`} trailing={<span className="tnum text-sm">{snapshot.seats.planId}</span>} chevron={false} />
              <MRow title="Seats left" trailing={<span className="tnum text-sm font-semibold">{snapshot.seats.available}</span>} chevron={false} />
            </MSection>
            <MSection title="People">
              {snapshot.people.map((person) => (
                <MRow key={person.id} title={person.fullName} subtitle={`${person.department} · ${person.role}`} chevron={false} />
              ))}
            </MSection>
            <MSection title="Email outbox" footer="Messages stay queued until a SendGrid key is configured. SMS is not used.">
              {snapshot.emails.length === 0 ? (
                <MRow title="Nothing queued" chevron={false} />
              ) : snapshot.emails.slice(0, 4).map((email) => (
                <MRow key={email.id} title={email.subject} subtitle={`${email.toAddress} · ${email.status}`} chevron={false} />
              ))}
            </MSection>
            <Button full loading={busy} onClick={invite}>Queue an invitation</Button>
            <Button full variant="secondary" loading={busy} onClick={download}>Download corrections CSV</Button>
          </>
        )}
        {message ? <p className="px-1 text-sm leading-relaxed text-ink">{message}</p> : null}
      </ScreenBody>
    </>
  );
}
