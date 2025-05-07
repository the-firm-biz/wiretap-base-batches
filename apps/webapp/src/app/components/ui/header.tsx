'use client';

import { Wallet } from '@/app/components/wallet/wallet';
import { textStyles } from '@/app/styles/template-strings';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/app/utils/cn';
import { ClassValue } from 'clsx';
interface HeaderProps {
  pageTitle: string;
  pageTitleClassName?: ClassValue;
  headerClassName?: ClassValue;
}

export function Header({
  pageTitle,
  pageTitleClassName,
  headerClassName
}: HeaderProps) {
  return (
    <header
      className={cn(
        'w-full p-4 flex items-center justify-between max-w-screen-md mx-auto',
        headerClassName
      )}
    >
      <h1 className={cn(textStyles['title3'], pageTitleClassName)}>
        {pageTitle}
      </h1>
      <div className="flex gap-4 items-center">
        <PaletteSwitcher />
        <Wallet />
      </div>
    </header>
  );
}

export function PaletteSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

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
