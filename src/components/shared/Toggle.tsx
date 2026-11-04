import { twMerge } from 'tailwind-merge';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  tone?: 'light' | 'dark';
}

export function Toggle({ checked, onChange, label, description, disabled, tone = 'light' }: ToggleProps) {
  return (
    <label className={twMerge('flex items-start justify-between gap-4', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
      <span className="min-w-0">
        <span className={twMerge('block text-sm font-medium', tone === 'light' ? 'text-ink' : 'text-white')}>{label}</span>
        {description && <span className={twMerge('mt-0.5 block text-xs', tone === 'light' ? 'text-muted' : 'text-navy-300')}>{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={twMerge('relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors duration-150', checked ? 'bg-primary' : tone === 'light' ? 'bg-line' : 'bg-white/20')}>
        
        <span className={twMerge('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ease-out', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </button>
    </label>);

}