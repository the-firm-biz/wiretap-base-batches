'use client';

import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { wagmiAdapter } from '@/app/utils/wagmi';
import { clientEnv } from '@/clientEnv';
import { createAppKit } from '@reown/appkit/react';
import { base, baseSepolia } from '@reown/appkit/networks';
import { siweConfig } from '@/app/utils/siwe/siwe-config';

const metadata = {
  name: 'WireTap',
  description:
    'Automatically snap up new tokens from social accounts you follow—before regular schmucks even know they’ve launched.',
  url: 'https://wiretap.thefirm.biz',
  icons: ['https://wiretap.thefirm.biz/wiretap-social-pfp-1024.png']
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId: clientEnv.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [base, baseSepolia],
  defaultNetwork: base,
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    socials: ['farcaster'] // @TODO - may need to remove this as it conflicts with Farcaster connector
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
