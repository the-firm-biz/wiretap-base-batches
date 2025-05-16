import { NeynarSearchedUser, NeynarUser } from '@wiretap/utils/server';
import { Address } from 'viem';
import { type Basename } from '@wiretap/utils/shared';

export type TargetTrackingStatus = {
  isTracking: boolean;
  isLoading: boolean;
  maxSpend: bigint;
  /** Only present if the target is coming from DB and not search results,
   *  used to untrack or update max spend for the target without looking it up one more time
   */
  targetAccountEntityId?: number;
};

/** Raw unformatted search result data */
export type SearchTarget = {
  neynarUser?: NeynarUser | NeynarSearchedUser;
  basename?: Basename;
  evmAddress?: Address;
  image?: string;
};

/** Target data formatted for the UI, coming from either search results or DB */
export type UITarget = {
  fid?: number;
  address?: Address;
  label: string;
  sublabel?: string;
  followerCount?: number;
  image?: string;
  searchTarget: SearchTarget;
  trackingStatus: TargetTrackingStatus;
};
