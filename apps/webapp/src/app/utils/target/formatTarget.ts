import { Address } from 'viem';
import { constructLabel } from './constructLabel';
import { constructSublabel } from './constructSublabel';
import { UnformattedTarget, type Target } from './types';

export const formatTarget = ({
  neynarUser,
  basename,
  evmAddress,
  image
}: UnformattedTarget): Target => ({
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
  image: image ?? neynarUser?.pfp_url
});
