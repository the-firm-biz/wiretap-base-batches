import type { NeynarUser } from '@wiretap/utils/server';
import { commitTokenDetailsToDb } from './commits/commit-token-details-to-db.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import type { Address } from 'viem';
import type { TokenScoreDetails } from './token-score/get-token-score.js';
import type { DeployTokenArgs } from './get-transaction-context.js';
import {
  getAccountEntityByFid,
  getAccountEntityByWalletAddress,
  PooledDbConnection
} from '@wiretap/db';
import { env } from './env.js';
import { commitAccountInfoToDb } from './commits/accounts/commit-account-info-to-db.js';

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
  const dbPool = new PooledDbConnection({ databaseUrl: env.DATABASE_URL });
  let accountEntityIdForAddress: number | undefined;
  let accountEntityIdForFid: number | undefined;
  let accountEntityId: number | undefined;

  try {
    await dbPool.db.transaction(async (tx) => {
      if (tokenCreatorAddress) {
        const accountEntityForAddress = await getAccountEntityByWalletAddress(
          tx,
          tokenCreatorAddress
        );
        accountEntityIdForAddress = accountEntityForAddress?.id;
      }

      const accountEntityForFid = await getAccountEntityByFid(
        tx,
        neynarUser.fid
      );
      accountEntityIdForFid = accountEntityForFid?.id;

      const hasConflictingAccountEntities =
        accountEntityIdForAddress &&
        accountEntityIdForFid &&
        accountEntityIdForAddress !== accountEntityIdForFid;

      if (hasConflictingAccountEntities) {
        // @TODO https://linear.app/the-firm/issue/ENG-305/token-watcher-conflicting-accountentityids-detectedsource
        throw new Error(
          'Account entity already exists for both address and fid'
        );
      }

      // JEFF!
      // Use getExistingAccountInfo to get the accountEntityId for this neynar user or address

      if (!accountEntityIdForAddress && !accountEntityIdForFid) {
        // @TODO Jeff - handle account creation above
        const { accountEntityId, wallets, farcasterAccounts, xAccounts } =
          await commitAccountInfoToDb(tx, {
            tokenCreatorAddress,
            neynarUser
          });
        // @TODO Jeff create new account entity
      }

      accountEntityId = accountEntityIdForAddress ?? accountEntityIdForFid;

      // [3 concurrent]
      // TODO: find users monitoring accountEntities connected to response's farcasterAccounts, wallets or xAccounts

      // [4 concurrent]
      // @TODO Jeff - call after accountEntityId is set
      return await commitTokenDetailsToDb({
        tokenCreatedData,
        accountEntityId,
        tokenScore: tokenScoreDetails?.tokenScore ?? null,
        imageUrl: transactionArgs?.tokenConfig?.image
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbPool.endPoolConnection();
  }
}
