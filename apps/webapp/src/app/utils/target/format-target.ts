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
  const address = authedAccountTarget.wallets[0]?.address ?? 'TODO';
  const farcasterAccount: FarcasterAccount | undefined =
    authedAccountTarget.farcasterAccounts[0];

  return {
    fid: farcasterAccount?.fid,
    address: address as Address,
    label: constructLabel({
      socialName: farcasterAccount?.displayName ?? undefined,
      socialUsername: farcasterAccount?.username,
      evmAddress: address as Address
    }),
    sublabel: constructSublabel({
      socialUsername: farcasterAccount?.username,
      evmAddress: address as Address
    }),
    image: farcasterAccount?.pfpUrl ?? undefined,
    // TODO: remove
    searchTarget: {
      evmAddress: address as Address
    },
    followerCount: farcasterAccount?.followerCount ?? undefined
  };
};
