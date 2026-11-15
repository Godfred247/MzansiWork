import { LogOutIcon, MoonIcon, SunIcon } from 'lucide-react';
import { clearToken } from '../../api/client';
import { useDemo } from '../../contexts/DemoStore';
import { useTheme } from '../../contexts/ThemeContext';
import { twMerge } from 'tailwind-merge';

export function EmployeeAccountControls({ compact = false }: {compact?: boolean;}) {
  const { dispatch } = useDemo();
  const { theme, toggleTheme } = useTheme();
  const controlClass = twMerge(
    'flex min-h-9 items-center gap-2 rounded-lg text-[13px] font-medium text-muted transition-colors hover:bg-hover hover:text-ink',
    compact ? 'justify-center px-2' : 'w-full px-3'
  );

  return (
    <div className={twMerge('flex gap-1', compact ? 'flex-col' : 'flex-col')}>
      <button type="button" className={controlClass} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={toggleTheme}>
        {theme === 'light' ? <MoonIcon className="h-4 w-4 shrink-0" aria-hidden /> : <SunIcon className="h-4 w-4 shrink-0" aria-hidden />}
        {!compact && <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>}
      </button>
      <button type="button" className={controlClass} aria-label="Sign out" title="Sign out" onClick={() => { clearToken('employee'); dispatch({ type: 'EMPLOYEE_SIGN_OUT' }); }}>
        <LogOutIcon className="h-4 w-4 shrink-0" aria-hidden />
        {!compact && <span>Sign out</span>}
      </button>
    </div>
  );
}
