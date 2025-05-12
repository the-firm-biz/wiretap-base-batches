import { NeynarSearchedUser, NeynarUser } from '@wiretap/utils/server';
import { Address } from 'viem';
import { type Basename } from '@wiretap/utils/shared';

export type UnformattedTarget = {
  neynarUser?: NeynarUser | NeynarSearchedUser;
  basename?: Basename;
  evmAddress?: Address;
  image?: string;
};

export type Target = {
  fid?: number;
  address: Address;
  label: string;
  sublabel?: string;
  followerCount?: number;
  image?: string;
};
