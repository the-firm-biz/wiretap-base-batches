'use client';

import { HeaderWalletButton } from '@/app/components/wallet/header-wallet-button';
import { textStyles } from '@/app/styles/template-strings';
import { cn } from '@/app/utils/cn';
import { ClassValue } from 'clsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/app/components/ui/dropdown-menu';
import { PaletteSwitcher } from '@/app/components/palette-switcher';
import { useAddFrame, useMiniKit } from '@coinbase/onchainkit/minikit';
import { Button } from './ui/button';
import { FarcasterIcon } from './icons/FarcasterIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { MenuIcon } from './icons/MenuIcon';
interface HeaderProps {
  pageTitle: string;
  pageTitleClassName?: ClassValue;
  headerClassName?: ClassValue;
}

function AddFrameMenuItem() {
  const addFrame = useAddFrame();
  const { context: miniKitContext } = useMiniKit();
  const hasMinikitContext = !!miniKitContext;
  const hasAddedFrame = miniKitContext?.client.added;

  if (!hasMinikitContext || hasAddedFrame) return null;

  return (
    <DropdownMenuItem asChild>
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 px-2 py-1.5 h-auto"
        onClick={async () => await addFrame()}
      >
        <FarcasterIcon className="w-4 h-4" /> Add Frame
      </Button>
    </DropdownMenuItem>
  );
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
        <div className="flex items-center gap-2">
          {hasMinikitContext && !hasAddedFrame && (
            <Button
              onClick={async () => await addFrame()}
              variant="outline"
              size="sm"
            >
              <FarcasterIcon className="w-4 h-4" /> Add Frame
            </Button>
          )}
          <HeaderWalletButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="iconSm" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AddFrameMenuItem />
              <DropdownMenuItem asChild>
                <a
                  href="https://thefirm.biz"
                  target="_blank"
                  className="w-full flex items-center gap-2"
                >
                  Get Our Next Release Early
                  <ExternalLinkIcon
                    className="w-4 h-4 opacity-70"
                    style={{ color: 'currentColor' }}
                  />
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <PaletteSwitcher />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
