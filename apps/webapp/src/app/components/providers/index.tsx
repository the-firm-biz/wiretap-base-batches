'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { TRPCReactProvider } from '@/app/trpc-clients/trpc-react-client';
import { WalletProvider } from './wallet-provider';
import { ThemeProvider } from './theme-provider';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { base } from 'viem/chains';
import { clientEnv } from '@/clientEnv';

export default function Providers({
  children,
  cookies
}: {
  children: React.ReactNode;
  cookies: string | null;
}) {
  return (
    <ThemeProvider>
      <MiniKitProvider
        apiKey={clientEnv.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
        config={{
          appearance: {
            mode: 'auto',
            theme: 'snake',
            name: 'WireTap',
            logo: '/wiretap-social-pfp-1024.png'
          }
        }}
      >
        <WalletProvider cookies={cookies}>
          <TRPCReactProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            {children}
          </TRPCReactProvider>
        </WalletProvider>
      </MiniKitProvider>
    </ThemeProvider>
  );
}
