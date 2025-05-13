'use client';

import Image from 'next/image';
import { useAccount } from 'wagmi';
import PageContainer from '../page-container';
import { Button } from '../ui/button';
import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { textStyles } from '../../styles/template-strings';
import DitheredAnimation from '../../components/dithered-animation';
import { SupportedProtocolsCarousel } from './supported-protocols-carousel';
import { getDecodedSiweSessionCookie } from '@/app/utils/siwe/siwe-cookies';
import { cn } from '@/app/utils/cn';
import Link from 'next/link';
import { TypewriterText } from '../animated-typewriter-text';
import React, { useState } from 'react';
import { FlashingDot } from '../flashing-dot';

export function ConnectedWalletGate({
  children
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const { open } = useAppKit();
  const { open: isOpen } = useAppKitState();

  const accountCookie = getDecodedSiweSessionCookie();
  const isPartiallyConnected = !!address && isOpen && !accountCookie;

  const [logoLoaded, setLogoLoaded] = useState(false);

  if (!address || isPartiallyConnected) {
    return (
      <PageContainer>
        <div className="flex flex-1 flex-col h-full gap-4">
          <div className="flex justify-between">
            <div>
              <div
                className={`relative inline-block transition-opacity duration-700 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
              >
                <Image
                  className="block dark:hidden"
                  src="/logo-wiretap-onlight.svg"
                  alt="WireTap Logo"
                  width={128}
                  height={42}
                  onLoad={() => setLogoLoaded(true)}
                />
                <Image
                  className="hidden dark:block"
                  src="/logo-wiretap-ondark.svg"
                  alt="WireTap Logo"
                  width={128}
                  height={42}
                  onLoad={() => setLogoLoaded(true)}
                />
                <FlashingDot className="w-0.75 h-0.75 absolute top-[9px] right-[1.5px]" />
              </div>
            </div>
            <div>{/* Where 'Menu' is on the design */}</div>
          </div>

          <div className="p-4 border border-border rounded-md flex flex-col flex-1 relative overflow-hidden">
            <DitheredAnimation
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none'
              }}
            />
            <div className="relative z-10 flex flex-col flex-1">
              <div className="w-[184px] flex flex-col gap-4">
                <p>
                  <TypewriterText
                    text={
                      "Automatically snap up tokens from social accounts you follow...\n\n...before regular schmucks even know they've launched."
                    }
                    className={cn(textStyles['body'], 'bg-background')}
                    emphasisClass={cn(
                      textStyles['body-emphasis'],
                      'bg-background'
                    )}
                    emphasisStart={65}
                  />
                </p>
              </div>
              <div className="flex-1" />
              <Button size="lg" onClick={() => open()} variant="secondary">
                Initiate Protocol
              </Button>
            </div>
          </div>
          <div>
            <p className={`${textStyles['compact']} mb-2`}>
              TRACKING TOKEN LAUNCHES ON
            </p>
            <SupportedProtocolsCarousel />
          </div>
          <Button
            asChild
            size="lg"
            onClick={() => open()}
            variant="outline"
            className="mb-8"
          >
            <Link
              href="https://thefirm.biz"
              target="blank"
              rel="noopener noreferrer"
            >
              Get Our Next Release Early
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return <>{children}</>;
}
