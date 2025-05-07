'use client';

import { Wallet } from '@/app/components/wallet/wallet';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Header() {
  return (
    <header className="w-full h-[60px] py-4 px-6 flex items-center justify-between border-b">
      <div className="flex items-center" />
      <PaletteSwitcher />
      <div className="flex items-center">
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
