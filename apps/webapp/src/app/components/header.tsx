'use client';

import { HeaderWalletButton } from '@/app/components/wallet/header-wallet-button';
import { textStyles } from '@/app/styles/template-strings';
import { useTheme } from 'next-themes';
import { cn } from '@/app/utils/cn';
import { ClassValue } from 'clsx';
import { useIsMounted } from '@/app/hooks/use-is-mounted';
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
    <header className={cn('w-full p-4', headerClassName)}>
      <div className="mx-auto flex items-center justify-between max-w-screen-md">
        <h1 className={cn(textStyles['title3'], pageTitleClassName)}>
          {pageTitle}
        </h1>
        <div className="flex gap-4 items-center">
          <PaletteSwitcher />
          <HeaderWalletButton />
        </div>
      </div>
    </header>
  );
}

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
