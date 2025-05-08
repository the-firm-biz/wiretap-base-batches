import { AuthedAccountTarget } from '@/server/api/trpc-routers/wiretap-account-router/routes/get-authed-account-targets';
import { SearchTarget } from './types';
import { isAddressEqual } from '@wiretap/utils/shared';
import { Address } from 'viem';

const walletArraysIntersect = (
  wallets: Address[],
  targetWallets: Address[]
) => {
  return wallets.some((wallet) =>
    targetWallets.some((targetWallet) => isAddressEqual(wallet, targetWallet))
  );
};

export const isAuthedAccountTrackingTarget = (
  target: SearchTarget,
  authedAccountTargets?: AuthedAccountTarget[]
) => {
  if (!authedAccountTargets || authedAccountTargets.length === 0) {
    return false;
  }
  const { neynarUser, evmAddress } = target;

  const targetFid = neynarUser?.fid;
  if (targetFid) {
    const isTrackingFid = authedAccountTargets.some((target) =>
      target.farcasterAccounts.find((f) => f.fid === targetFid)
    );
    if (isTrackingFid) {
      return true;
    }
  }

  const neynarEthWallets = neynarUser?.verified_addresses.eth_addresses ?? [];
  const targetAddresses = neynarEthWallets.reduce(
    (acc, cur) => {
      if (!acc.some((w) => isAddressEqual(w, cur as Address))) {
        acc.push(cur as Address);
      }
      return acc;
    },
    evmAddress ? [evmAddress] : []
  );

  const isTrackingAddress = authedAccountTargets.some((account) => {
    const accountWallets = account.wallets.map((w) => w.address) as Address[];
    return walletArraysIntersect(accountWallets, targetAddresses);
  });

  return isTrackingAddress;
};
