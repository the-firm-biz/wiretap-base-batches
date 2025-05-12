'use client';

import { HeaderWalletButton } from '@/app/components/wallet/header-wallet-button';
import { textStyles } from '@/app/styles/template-strings';
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
    <header className={cn('w-full p-4', headerClassName)}>
      <div className="mx-auto flex items-center justify-between max-w-screen-md">
        <h1 className={cn(textStyles['title3'], pageTitleClassName)}>
          {pageTitle}
        </h1>
        <div className="flex items-center">
          <HeaderWalletButton />
        </div>
      </div>
    </header>
  );
}
