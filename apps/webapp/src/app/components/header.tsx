'use client';

import { HeaderWalletButton } from '@/app/components/wallet/header-wallet-button';
import { textStyles } from '@/app/styles/template-strings';
import { cn } from '@/app/utils/cn';
import { ClassValue } from 'clsx';
<<<<<<< HEAD
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/app/components/ui/dropdown-menu';
import { PaletteSwitcher } from '@/app/components/palette-switcher';
import { FarcasterIcon } from '@/app/components/icons/FarcasterIcon';
import { useAddFrame, useMiniKit } from '@coinbase/onchainkit/minikit';
import { Button } from '@/app/components/ui/button';
import { Menu, ExternalLink } from 'lucide-react';
import React from 'react';

=======
import { useAddFrame, useMiniKit } from '@coinbase/onchainkit/minikit';
import { Button } from './ui/button';
import { FarcasterIcon } from './icons/FarcasterIcon';
>>>>>>> 1c9ffd80063f6b84d7232d03bb8dbc4f547d60bf
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
<<<<<<< HEAD
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AddFrameMenuItem />
              <DropdownMenuItem asChild>
                <a
                  href="https://thefirm.biz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2"
                >
                  Get Our Next Release Early
                  <ExternalLink
                    className="w-4 h-4 opacity-70"
                    style={{ color: 'currentColor' }}
                  />
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <div className="w-full flex items-center gap-2">
                  <PaletteSwitcher />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
=======
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
>>>>>>> 1c9ffd80063f6b84d7232d03bb8dbc4f547d60bf
          <HeaderWalletButton />
        </div>
      </div>
    </header>
  );
}
