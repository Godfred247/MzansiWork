
export function StepProgress({ step, total, label }: {step: number;total: number;label: string;}) {
  const left = total - step;
  return (
    <div className="px-4 pb-1 pt-3">
      <div className="flex gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={`Setup progress: ${label}`}>
        {Array.from({ length: total }).map((_, i) =>
        <span key={i} className={`h-1 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-line'}`} />
        )}
      </div>
      <p className="mt-2 text-xs text-muted">
        <span className="font-medium text-ink">{label}</span> · {left === 0 ? 'last step' : `${left} step${left === 1 ? '' : 's'} left`}
      </p>
    </div>);

}