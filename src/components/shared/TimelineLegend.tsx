
const items = [
{ cls: 'bg-primary', label: 'Work (recorded)' },
{ cls: 'bg-teal', label: 'Break' },
{ cls: 'hatch-warning border border-warning-fill/50', label: 'Idle observation' },
{ cls: 'hatch-info border border-warning-fill/50', label: 'Explained & approved' }];


export function TimelineLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted" aria-label="Timeline legend">
      {items.map((i) =>
      <li key={i.label} className="flex items-center gap-1.5">
          <span aria-hidden className={`h-2.5 w-4 rounded-[3px] ${i.cls}`} />
          {i.label}
        </li>
      )}
    </ul>);

}