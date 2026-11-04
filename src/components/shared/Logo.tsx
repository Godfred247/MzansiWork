import { twMerge } from 'tailwind-merge';
import { brand } from '../../data/brand';

interface LogoProps {
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const box = { sm: 'h-6 w-6 text-[13px] rounded-md', md: 'h-8 w-8 text-base rounded-lg', lg: 'h-12 w-12 text-2xl rounded-xl' };
const text = { sm: 'text-sm', md: 'text-base', lg: 'text-2xl' };

export function Logo({ tone = 'light', size = 'md', showName = true, className }: LogoProps) {
  return (
    <span className={twMerge('inline-flex items-center gap-2', className)}>
      <span aria-hidden className={twMerge('relative flex items-center justify-center font-bold', box[size], tone === 'light' ? 'bg-navy text-white' : 'bg-white text-navy')}>
        {brand.mark}
        <span className="absolute bottom-[18%] right-[18%] h-[18%] w-[18%] rounded-full bg-teal" />
      </span>
      {showName ?
      <span className={twMerge('font-semibold tracking-tight', text[size], tone === 'light' ? 'text-navy' : 'text-white')}>{brand.name}</span> :

      <span className="sr-only">{brand.name}</span>
      }
    </span>);

}