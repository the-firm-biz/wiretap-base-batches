'use client';

import { useTheme } from 'next-themes';
import { useIsMounted } from '@/app/hooks/use-is-mounted';
import { Sun, Moon } from 'lucide-react';
import { DropdownMenuItem } from './ui/dropdown-menu';

export function PaletteSwitcher() {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  const isDark = theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const Icon = isDark ? Moon : Sun;

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        setTheme(nextTheme);
      }}
      aria-label="Toggle interface theme"
    >
      Interface Theme
      <Icon className="w-4 h-4 ml-auto" />
    </DropdownMenuItem>
  );
}
