import { twMerge } from 'tailwind-merge';

const palette = ['bg-navy text-white', 'bg-primary text-white', 'bg-teal-dark text-white', 'bg-navy-500 text-white', 'bg-[#7C3AED] text-white', 'bg-[#B45309] text-white'];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) >>> 0;
  return h;
}

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  status?: 'online' | 'break' | 'off';
}

const sizes = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };

export function Avatar({ name, size = 'sm', className, status }: AvatarProps) {
  const initials = name.
  split(/[\s@.]+/).
  filter(Boolean).
  slice(0, 2).
  map((p) => p[0]?.toUpperCase()).
  join('');
  return (
    <span className={twMerge('relative inline-flex shrink-0', className)}>
      <span aria-hidden className={twMerge('inline-flex items-center justify-center rounded-full font-semibold', sizes[size], palette[hash(name) % palette.length])}>
        {initials}
      </span>
      {status &&
      <span
        aria-hidden
        className={twMerge(
          'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface',
          status === 'online' ? 'bg-success' : status === 'break' ? 'bg-info' : 'bg-subtle'
        )} />

      }
    </span>);

}