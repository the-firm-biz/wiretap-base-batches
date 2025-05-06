import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia } from '@reown/appkit/networks';
import { clientEnv } from '@/clientEnv';

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  projectId: clientEnv.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [base, baseSepolia]
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
