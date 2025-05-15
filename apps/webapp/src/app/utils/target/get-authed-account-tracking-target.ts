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

/** Using the search result target - gets the tracking status info from the
 *  authed account tracking targets retrieved from the DB
 */
export const getAuthedAccountTrackingTarget = ({
  targetEvmAddress,
  targetNeynarUser,
  authedAccountTargets
}: Args): {
  isTracking: boolean;
  maxSpend: bigint;
  targetAccountEntityId?: number;
} => {
  if (!authedAccountTargets || authedAccountTargets.length === 0) {
    return { isTracking: false, maxSpend: BigInt(0) };
  }

  const targetFid = targetNeynarUser?.fid;
  if (targetFid) {
    const trackedTargetByFid = authedAccountTargets.find((target) =>
      target.farcasterAccounts.find((f) => f.fid === targetFid)
    );
    if (trackedTargetByFid) {
      return {
        isTracking: true,
        maxSpend: trackedTargetByFid.tracker.maxSpend,
        targetAccountEntityId: trackedTargetByFid.tracker.trackedAccountEntityId
      };
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

  const trackedTargetByAddress = authedAccountTargets.find((account) => {
    const accountWallets = account.wallets.map((w) => w.address) as Address[];
    return walletArraysIntersect(accountWallets, targetAddresses);
  });

  if (trackedTargetByAddress) {
    return {
      isTracking: true,
      maxSpend: trackedTargetByAddress.tracker.maxSpend,
      targetAccountEntityId:
        trackedTargetByAddress.tracker.trackedAccountEntityId
    };
  }

  return { isTracking: false, maxSpend: BigInt(0) };
};
