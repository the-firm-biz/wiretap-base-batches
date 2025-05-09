import type { NeynarUser } from '@wiretap/utils/server';
import { commitTokenDetailsToDb } from './commits/commit-token-details-to-db.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import type { Address } from 'viem';
import type { TokenScoreDetails } from './token-score/get-token-score.js';

export async function handleTokenWithFarcasterUser(
  tokenCreatedData: TokenCreatedOnChainParams,
  tokenCreatorAddress: Address,
  neynarUser: NeynarUser,
  tokenScoreDetails: TokenScoreDetails | null
) {
  // [3 concurrent]
  // TODO: find users monitoring accountEntities connected to response's farcasterAccounts, wallets or xAccounts

  // [4 concurrent]
  return await commitTokenDetailsToDb({
    tokenCreatedData,
    tokenCreatorAddress,
    neynarUser,
    tokenScore: tokenScoreDetails?.tokenScore ?? null
  });
}
