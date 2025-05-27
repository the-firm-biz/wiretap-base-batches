import type { NeynarUser } from '@wiretap/utils/server';
import { commitTokenDetailsToDb } from './commits/commit-token-details-to-db.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import type { Address } from 'viem';
import type { TokenScoreDetails } from './token-score/get-token-score.js';
import type { DeployTokenArgs } from './get-transaction-context.js';

interface HandleTokenWithFarcasterUserParams {
  tokenCreatedData: TokenCreatedOnChainParams;
  neynarUser: NeynarUser;
  tokenScoreDetails: TokenScoreDetails | null;
  transactionArgs: DeployTokenArgs;
  tokenCreatorAddress: Address | null;
}

export async function handleTokenWithFarcasterUser({
  tokenCreatedData,
  neynarUser,
  tokenScoreDetails,
  transactionArgs,
  tokenCreatorAddress
}: HandleTokenWithFarcasterUserParams) {
  let accountEntityId: number | undefined;

  const existingAccountEntity = await getAccountEntityByFid(tx, {
    fid: neynarUser.fid
  });

  // [3 concurrent]
  // TODO: find users monitoring accountEntities connected to response's farcasterAccounts, wallets or xAccounts

  // [4 concurrent]
  return await commitTokenDetailsToDb({
    tokenCreatedData,
    tokenCreatorAddress,
    neynarUser,
    tokenScore: tokenScoreDetails?.tokenScore ?? null,
    imageUrl: transactionArgs?.tokenConfig?.image
  });
}
