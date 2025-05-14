'use client';

import { HeaderWalletButton } from '@/app/components/wallet/header-wallet-button';
import { textStyles } from '@/app/styles/template-strings';
import { cn } from '@/app/utils/cn';
import { ClassValue } from 'clsx';
import { useAddFrame, useMiniKit } from '@coinbase/onchainkit/minikit';
import { Button } from './ui/button';
import { FarcasterIcon } from './icons/FarcasterIcon';
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
  const { context: miniKitContext } = useMiniKit();
  const addFrame = useAddFrame();
  const hasMinikitContext = !!miniKitContext;
  const hasAddedFrame = miniKitContext?.client.added;

  return (
    <header className={cn('w-full p-4', headerClassName)}>
      <div className="mx-auto flex items-center justify-between max-w-screen-md">
        <h1 className={cn(textStyles['title3'], pageTitleClassName)}>
          {pageTitle}
        </h1>
        <div className="flex items-center gap-4">
          {hasMinikitContext && !hasAddedFrame && (
            <Button
              onClick={async () => await addFrame()}
              variant="outline"
              size="sm"
              className="h-[32px]"
            >
              <FarcasterIcon className="w-4 h-4" /> Add Frame
            </Button>
          )}
          <HeaderWalletButton />
        </div>
      </div>
    </header>
  );
}
