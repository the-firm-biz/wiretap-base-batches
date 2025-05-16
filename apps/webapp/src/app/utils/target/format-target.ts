import { Address } from 'viem';
import { constructLabel } from './construct-label';
import { constructSublabel } from './construct-sublabel';
import { SearchTarget, type UITarget } from './types';
import { type AuthedAccountTarget } from '@/server/api/trpc-routers/wiretap-account-router/routes/get-authed-account-targets';
import { type FarcasterAccount } from '@wiretap/db';

export const searchToUiTarget = ({
  neynarUser,
  basename,
  evmAddress,
  image
}: SearchTarget): UITarget => ({
  fid: neynarUser?.fid,
  address:
    evmAddress ??
    (neynarUser?.verified_addresses.primary.eth_address as Address),
  label: constructLabel({
    socialName: neynarUser?.display_name,
    basename,
    evmAddress:
      evmAddress ??
      (neynarUser?.verified_addresses.primary.eth_address as Address),
    socialUsername: neynarUser?.username
  }),
  sublabel: constructSublabel({
    socialUsername: neynarUser?.username,
    evmAddress:
      evmAddress ??
      (neynarUser?.verified_addresses.primary.eth_address as Address)
  }),
  followerCount: neynarUser?.follower_count,
  image: image ?? neynarUser?.pfp_url,
  trackingStatus: {
    isTracking: false,
    isLoading: false,
    maxSpend: BigInt(0)
  },
  searchTarget: {
    neynarUser,
    basename,
    evmAddress,
    image
  }
});

export const authedAccountTargetToUiTarget = (
  authedAccountTarget: AuthedAccountTarget
): UITarget => {
  const address: Address | undefined =
    (authedAccountTarget.wallets[0]?.address as Address) ?? undefined;
  const farcasterAccount: FarcasterAccount | undefined =
    authedAccountTarget.farcasterAccounts[0];
  const basename = authedAccountTarget.basename;

  return {
    fid: farcasterAccount?.fid,
    address: address,
    label: constructLabel({
      socialName: farcasterAccount?.displayName ?? undefined,
      socialUsername: farcasterAccount?.username,
      evmAddress: address,
      basename
    }),
    sublabel: constructSublabel({
      socialUsername: farcasterAccount?.username,
      evmAddress: address
    }),
    image: farcasterAccount?.pfpUrl ?? authedAccountTarget.basenameAvatar,
    // TODO: Search target is not really used in the case of target coming from the DB,
    // but it is here to simply satisfy typescript. Ideally rethink how to optimize types to pass less data around
    searchTarget: {
      evmAddress: address
    },
    followerCount: farcasterAccount?.followerCount ?? undefined,
    trackingStatus: {
      isTracking: true,
      isLoading: false,
      maxSpend: authedAccountTarget.tracker.maxSpend,
      targetAccountEntityId: authedAccountTarget.tracker.trackedAccountEntityId
    }
  };
};
