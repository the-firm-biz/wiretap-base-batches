import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia, mainnet } from '@reown/appkit/networks';
import { clientEnv } from '@/clientEnv';

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId: clientEnv.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [base, baseSepolia, mainnet] // mainnet used for ENS resolution
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
