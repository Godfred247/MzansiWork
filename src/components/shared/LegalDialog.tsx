import { Dialog } from './Dialog';
import { legal } from '../../data/legal';

export function LegalDialog({ doc, onClose }: { doc: 'privacy' | 'terms' | null; onClose: () => void }) {
  const item = doc ? legal[doc] : null;
  return (
    <Dialog open={!!item} onClose={onClose} title={item?.title ?? 'Notice'} description={item ? `Updated ${item.updated}` : undefined} size="lg">
      {item &&
      <article className="space-y-4 pb-3">
        <p className="text-[13px] leading-relaxed text-ink">{item.intro}</p>
        {item.sections.map((section) =>
        <section key={section.heading}>
          <h3 className="text-sm font-semibold text-ink">{section.heading}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{section.body}</p>
        </section>
        )}
      </article>
      }
    </Dialog>);

}
