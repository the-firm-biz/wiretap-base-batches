'use client';

import { useTheme } from 'next-themes';
import { useIsMounted } from '@/app/hooks/use-is-mounted';

export function PaletteSwitcher() {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <div className="flex gap-2">
      <button
        className={theme === 'light' ? 'font-bold underline' : ''}
        onClick={() => setTheme('light')}
      >
        Light
      </button>
      <button
        className={theme === 'dark' ? 'font-bold underline' : ''}
        onClick={() => setTheme('dark')}
      >
        Dark
      </button>
    </div>
  );
}
