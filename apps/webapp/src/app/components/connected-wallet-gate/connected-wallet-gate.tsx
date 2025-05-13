'use client';

import Image from 'next/image';
import { useAccount } from 'wagmi';
import PageContainer from '../page-container';
import { Button } from '../ui/button';
import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { textStyles } from '../../styles/template-strings';
import { SupportedProtocolsCarousel } from './supported-protocols-carousel';
import { getDecodedSiweSessionCookie } from '@/app/utils/siwe/siwe-cookies';

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

  if (!address || isPartiallyConnected) {
    return (
      <PageContainer>
        <div className="flex flex-1 flex-col h-full gap-4">
          <div className="flex justify-between">
            <div>
              <Image
                className="block dark:hidden"
                src="/logo-wiretap-onlight.svg"
                alt="WireTap Logo"
                width={128}
                height={42}
              />
              <Image
                className="hidden dark:block"
                src="/logo-wiretap-ondark.svg"
                alt="WireTap Logo"
                width={128}
                height={42}
              />
            </div>
            <div>{/* Where 'Menu' is on the design */}</div>
          </div>
          <div className="p-4 border border-border rounded-md flex flex-col h-full flex-1 justify-between">
            <div className="w-[184px] flex flex-col gap-4">
              <p>
                Automatically snap up tokens from social accounts you follow...
              </p>
              <p className={textStyles['body-emphasis']}>
                ...before regular shmucks even know they&apos;ve launched.
              </p>
            </div>
            <Button size="lg" onClick={() => open()} variant="outline">
              Initiate Protocol
            </Button>
          </div>
          <div>
            <p className={`${textStyles['compact']} mb-2`}>
              TRACKING TOKEN LAUNCHES ON
            </p>
            <SupportedProtocolsCarousel />
          </div>
        </div>
      </PageContainer>
    );
  }

  return <>{children}</>;
}
