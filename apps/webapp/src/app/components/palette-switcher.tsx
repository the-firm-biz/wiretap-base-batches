'use client';

import { useTheme } from 'next-themes';
import { useIsMounted } from '@/app/hooks/use-is-mounted';
import { Sun, Moon } from 'lucide-react';

export function PaletteSwitcher() {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <div className="flex gap-1 items-center">
      <button
        aria-label="Switch to light theme"
        className={`p-1 rounded-md transition-colors ${theme === 'light' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        onClick={() => setTheme('light')}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        aria-label="Switch to dark theme"
        className={`p-1 rounded-md transition-colors ${theme === 'dark' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        onClick={() => setTheme('dark')}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
