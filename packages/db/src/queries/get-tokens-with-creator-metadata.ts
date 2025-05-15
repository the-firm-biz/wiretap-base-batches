import { and, desc, eq } from 'drizzle-orm';
import { tokens } from '../schema/tokens.js';
import { farcasterAccounts } from '../schema/accounts/farcaster-accounts.js';
import { pools } from '../schema/pools.js';
import { accountEntities } from '../schema/accounts/account-entities.js';
import type { ServerlessDbTransaction } from '../client.js';
import type { HttpDb } from '../client.js';
import type { ServerlessDb } from '../client.js';

export async function getTokensWithCreatorMetadata(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb
  // @todo type this and export type
): Promise<any[]> {
  return await db
    .select({
      // Token fields
      tokenSymbol: tokens.symbol,
      tokenAddress: tokens.address,
      tokenName: tokens.name,
      tokenTotalSupply: tokens.totalSupply,
      tokenDeploymentTxHash: tokens.deploymentTransactionHash,

      // Farcaster account fields
      farcasterFid: farcasterAccounts.fid,
      farcasterUsername: farcasterAccounts.username,
      farcasterDisplayName: farcasterAccounts.displayName,
      farcasterPfpUrl: farcasterAccounts.pfpUrl,
      farcasterFollowerCount: farcasterAccounts.followerCount,

      // Pool fields
      poolAthMcapUsd: pools.athMcapUsd,
      poolAddress: pools.address,
      poolFeeBps: pools.feeBps,
      isPrimaryPool: pools.isPrimary
    })
    .from(tokens)
    .innerJoin(accountEntities, eq(tokens.accountEntityId, accountEntities.id))
    .innerJoin(
      farcasterAccounts,
      eq(accountEntities.id, farcasterAccounts.accountEntityId)
    )
    .leftJoin(
      pools,
      and(eq(pools.tokenId, tokens.id), eq(pools.isPrimary, true))
    )
    .orderBy(desc(tokens.createdAt))
    .limit(50);
}
