import { AuthedAccountTarget } from '@/server/api/trpc-routers/wiretap-account-router/routes/get-authed-account-targets';
import { isAddressEqual } from '@wiretap/utils/shared';
import { Address } from 'viem';
import { NeynarSearchedUser } from '@wiretap/utils/server';
import { NeynarUser } from '@wiretap/utils/server';

const walletArraysIntersect = (
  wallets: Address[],
  targetWallets: Address[]
) => {
  return wallets.some((wallet) =>
    targetWallets.some((targetWallet) => isAddressEqual(wallet, targetWallet))
  );
};

interface Args {
  targetEvmAddress?: Address;
  targetNeynarUser?: NeynarUser | NeynarSearchedUser;
  authedAccountTargets?: AuthedAccountTarget[];
}

export const isAuthedAccountTrackingTarget = ({
  targetEvmAddress,
  targetNeynarUser,
  authedAccountTargets
}: Args) => {
  if (!authedAccountTargets || authedAccountTargets.length === 0) {
    return false;
  }

  const targetFid = targetNeynarUser?.fid;
  if (targetFid) {
    const isTrackingFid = authedAccountTargets.some((target) =>
      target.farcasterAccounts.find((f) => f.fid === targetFid)
    );
    if (isTrackingFid) {
      return true;
    }
  }

  const neynarEthWallets =
    targetNeynarUser?.verified_addresses.eth_addresses ?? [];
  const targetAddresses = neynarEthWallets.reduce(
    (acc, cur) => {
      if (!acc.some((w) => isAddressEqual(w, cur as Address))) {
        acc.push(cur as Address);
      }
      return acc;
    },
    targetEvmAddress ? [targetEvmAddress] : []
  );

  const isTrackingAddress = authedAccountTargets.some((account) => {
    const accountWallets = account.wallets.map((w) => w.address) as Address[];
    return walletArraysIntersect(accountWallets, targetAddresses);
  });

  return isTrackingAddress;
};
