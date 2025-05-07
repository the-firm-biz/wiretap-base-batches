'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { TRPCReactProvider } from '@/app/trpc-clients/trpc-react-client';
import { WalletProvider } from './wallet-provider';
import { ThemeProvider } from './theme-provider';

export default function Providers({
  children,
  cookies
}: {
  children: React.ReactNode;
  cookies: string | null;
}) {
  return (
    <ThemeProvider>
      <WalletProvider cookies={cookies}>
        <TRPCReactProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          {children}
        </TRPCReactProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
