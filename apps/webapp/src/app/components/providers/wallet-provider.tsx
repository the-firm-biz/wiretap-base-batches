'use client';

import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { wagmiAdapter } from '@/app/utils/wagmi';
import { clientEnv } from '@/clientEnv';
import { createAppKit } from '@reown/appkit/react';
import { base, baseSepolia } from '@reown/appkit/networks';
import { siweConfig } from '@/app/utils/siwe/siwe-config';
const metadata = {
  name: 'WireTap',
  description: 'WireTap', // @TODO: Add a description
  url: 'https://wiretap.thefirm.biz', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932'] // TODO: Add a logo
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId: clientEnv.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [base, baseSepolia],
  defaultNetwork: base,
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    socials: ['farcaster']
  },
  siweConfig: siweConfig
});

export function WalletProvider({
  children,
  cookies
}: {
  children: React.ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      {children}
    </WagmiProvider>
  );
}
