import { NeynarSearchedUser, NeynarUser } from '@wiretap/utils/server';
import { Address } from 'viem';
import { type Basename } from '@wiretap/utils/shared';

/** TODO: comment. Raw unformatted search result data */
export type SearchTarget = {
  neynarUser?: NeynarUser | NeynarSearchedUser;
  basename?: Basename;
  evmAddress?: Address;
  image?: string;
};

export type UITarget = {
  fid?: number;
  address: Address;
  label: string;
  sublabel?: string;
  followerCount?: number;
  image?: string;
  searchTarget: SearchTarget;
};
