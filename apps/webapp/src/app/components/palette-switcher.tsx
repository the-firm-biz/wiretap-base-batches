'use client';

import { useTheme } from 'next-themes';
import { useIsMounted } from '@/app/hooks/use-is-mounted';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { DropdownMenuItem } from './ui/dropdown-menu';

export function PaletteSwitcher() {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  const isDark = theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const Icon = isDark ? MoonIcon : SunIcon;

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        setTheme(nextTheme);
      }}
      aria-label="Toggle interface theme"
    >
      Interface Theme
      <Icon className="opacity-70 ml-auto" />
    </DropdownMenuItem>
  );
}
