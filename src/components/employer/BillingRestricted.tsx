import { useDemo } from '../../contexts/DemoStore';
import { seatUsage } from '../../utils/seats';
import { viewerRoleLabel } from '../../utils/permissions';
import { AccessDenied } from '../shared/AccessDenied';
import { SeatMeter } from '../shared/SeatMeter';
import { MSection } from './MSection';

export function BillingRestricted() {
  const { state } = useDemo();
  return (
    <div className="space-y-5">
      <AccessDenied
        title="Billing is managed by the account owner"
        body="Plan changes, payment details and invoices are only available to Lerato Mokoena (owner). Billing access is never granted automatically to managers — the owner can delegate it explicitly."
        attempted="GET /api/organisations/karoo/subscription"
        role={`${viewerRoleLabel(state.viewerRole)} — no billing permission`} />
      
      <MSection title="Seat availability (read-only)" footer="Shown so you know whether you can invite someone. Ask the owner if more seats are needed.">
        <div className="p-4">
          <SeatMeter usage={seatUsage(state)} />
        </div>
      </MSection>
    </div>);

}