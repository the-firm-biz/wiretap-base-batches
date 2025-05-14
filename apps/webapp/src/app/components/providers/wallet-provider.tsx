'use client';

import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { clientEnv } from '@/clientEnv';
import { createAppKit } from '@reown/appkit/react';
import { siweConfig } from '@/app/utils/siwe/siwe-config';
import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia, mainnet } from '@reown/appkit/networks';
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId: clientEnv.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [base, baseSepolia, mainnet], // mainnet used for ENS resolution,
  connectors: [miniAppConnector()]
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

const metadata = {
  name: 'WireTap',
  description:
    'Automatically snap up new tokens from social accounts you follow — before regular schmucks even know they’ve launched.',
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
    socials: false,
    email: false
  },
  featuredWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa' // Will Always suggest Coinbase Wallet
  ],
  // featuredWalletIds: [
  //   "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
  // ], @tod Find Farcaster wallet ID and add it here idk wtf it is and it isn't in the WalletConnect docs but it exists
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
