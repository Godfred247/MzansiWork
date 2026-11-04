import { BookOpenIcon } from 'lucide-react';
import { EmptyState } from '../../components/shared/EmptyState';

export function DocsView() {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center bg-canvas">
      <EmptyState icon={BookOpenIcon} title="Docs are in progress" body="Design system, permission matrix, seat rules and handoff notes will appear here." />
    </main>);

}