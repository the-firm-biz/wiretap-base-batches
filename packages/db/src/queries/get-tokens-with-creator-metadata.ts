import { and, desc, eq, lt, or } from 'drizzle-orm';
import { tokens } from '../schema/tokens.js';
import { farcasterAccounts } from '../schema/accounts/farcaster-accounts.js';
import { pools } from '../schema/pools.js';
import { accountEntities } from '../schema/accounts/account-entities.js';
import type { ServerlessDbTransaction } from '../client.js';
import type { HttpDb } from '../client.js';
import type { ServerlessDb } from '../client.js';
import { contracts } from '../schema/contracts.js';
import { wallets } from '../schema/index.js';

export interface TokenWithCreatorMetadataCursor {
  createdAt: Date;
  id: number;
}

export interface TokenWithCreatorMetadata {
  tokenId: number;
  tokenSymbol: string;
  tokenAddress: string;
  tokenName: string;
  tokenTotalSupply: number;
  tokenDeploymentTxHash: string;
  tokenCreatedAt: Date;
  tokenImageUrl: string | null;
  creatorTokenIndex: number;
  creatorAddress: string | null;
  deploymentContractAddress: string;
  farcasterFid: number | null;
  farcasterUsername: string | null;
  farcasterDisplayName: string | null;
  farcasterPfpUrl: string | null;
  farcasterFollowerCount: number | null;
  poolAthMcapUsd: number | null;
  poolStartingMcapUsd: number | null;
  poolAddress: string | null;
}

interface GetTokensWithCreatorMetadataArgs {
  pageSize?: number;
  cursor?: TokenWithCreatorMetadataCursor;
}

// @todo discover - tokens are duplicated with this uquery
export async function getTokensWithCreatorMetadata(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  { pageSize = 50, cursor }: GetTokensWithCreatorMetadataArgs
): Promise<TokenWithCreatorMetadata[]> {
  return await db
    .select({
      // Token fields
      tokenId: tokens.id,
      tokenSymbol: tokens.symbol,
      tokenAddress: tokens.address,
      tokenName: tokens.name,
      tokenImageUrl: tokens.imageUrl,
      tokenTotalSupply: tokens.totalSupply,
      tokenDeploymentTxHash: tokens.deploymentTransactionHash,
      tokenCreatedAt: tokens.createdAt,
      creatorTokenIndex: tokens.creatorTokenIndex,

      // Wallets fields
      creatorAddress: wallets.address,

      // Contract fields
      deploymentContractAddress: contracts.address,

      // Farcaster account fields
      farcasterFid: farcasterAccounts.fid,
      farcasterUsername: farcasterAccounts.username,
      farcasterDisplayName: farcasterAccounts.displayName,
      farcasterPfpUrl: farcasterAccounts.pfpUrl,
      farcasterFollowerCount: farcasterAccounts.followerCount,

      // Pool fields
      poolAthMcapUsd: pools.athMcapUsd,
      poolStartingMcapUsd: pools.startingMcapUsd,
      poolAddress: pools.address
    })
    .from(tokens)
    .innerJoin(accountEntities, eq(tokens.accountEntityId, accountEntities.id))
    .innerJoin(contracts, eq(tokens.deploymentContractId, contracts.id))
    .leftJoin(wallets, eq(tokens.accountEntityId, wallets.accountEntityId))
    .leftJoin(
      farcasterAccounts,
      eq(accountEntities.id, farcasterAccounts.accountEntityId)
    )
    .leftJoin(
      pools,
      and(eq(pools.tokenId, tokens.id), eq(pools.isPrimary, true))
    )
    .where(
      cursor
        ? or(
            lt(tokens.createdAt, cursor.createdAt),
            // In case multiple tokens are created at the same time, we use id to break the tie
            and(
              eq(tokens.createdAt, cursor.createdAt),
              lt(tokens.id, cursor.id)
            )
          )
        : undefined
    )
    .orderBy(desc(tokens.createdAt))
    .limit(pageSize);
}
