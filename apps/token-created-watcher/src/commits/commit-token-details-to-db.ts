import { env } from '../env.js';
import {
  type Contract,
  createBlock,
  type FarcasterAccount,
  getCurrency,
  getOrCreateDeployerContract,
  getOrCreatePool,
  getOrCreateToken,
  PooledDbConnection,
  type Token,
  type Wallet,
  type XAccount,
  type Pool
} from '@wiretap/db';
import type { TokenCreatedOnChainParams } from '../types/token-created.js';
import type { Address } from 'viem';
import type { NeynarUser } from '@wiretap/utils/server';
import { commitAccountInfoToDb } from './commit-account-info-to-db.js';
import type { MinimalBlock } from '../types/block.js';
import { getRedis } from '@wiretap/redis';
import {
  CLANKER_3_1_UNISWAP_FEE_BPS,
  CLANKER_3_1_TOTAL_SUPPLY,
  INDEXING_POOLS_PUBSUB_CHANNEL
} from '@wiretap/config';

export type CommitTokenDetailsToDbParams = {
  tokenCreatedData: TokenCreatedOnChainParams;
  tokenCreatorAddress: Address;
  tokenScore: number | null;
  neynarUser?: NeynarUser;
  imageUrl?: string;
};

export type CommitTokenDetailsToDbResult = {
  block: MinimalBlock;
  accountEntityId: number;
  token: Token;
  deployerContract: Contract;
  wallets: Wallet[];
  farcasterAccounts: FarcasterAccount[];
  xAccounts: XAccount[];
  tokenPool: Pool;
};

/**
 * Saves token details to the DB together with account info related to the token creator
 */
export const commitTokenDetailsToDb = async ({
  tokenCreatedData: {
    tokenAddress,
    tokenName,
    symbol,
    deployerContractAddress,
    transactionHash,
    block,
    poolContext
  },
  tokenCreatorAddress,
  neynarUser,
  tokenScore,
  imageUrl
}: CommitTokenDetailsToDbParams): Promise<CommitTokenDetailsToDbResult> => {
  const dbPool = new PooledDbConnection({ databaseUrl: env.DATABASE_URL });
  const redis = getRedis({ redisUrl: env.REDIS_URL });

  try {
    return await dbPool.db.transaction(async (tx) => {
      const deployerContract = await getOrCreateDeployerContract(tx, {
        address: deployerContractAddress
      });

      const { accountEntityId, wallets, farcasterAccounts, xAccounts } =
        await commitAccountInfoToDb(tx, {
          tokenCreatorAddress,
          neynarUser
        });

      await createBlock(tx, {
        number: block.number,
        timestamp: block.timestamp
      });

      const createdToken = await getOrCreateToken(tx, {
        address: tokenAddress,
        score: tokenScore,
        deploymentContractId: deployerContract.id,
        deploymentTransactionHash: transactionHash,
        accountEntityId,
        symbol,
        name: tokenName,
        block: block.number,
        totalSupply: CLANKER_3_1_TOTAL_SUPPLY,
        imageUrl
      });

      const currency = await getCurrency(tx, poolContext.pairedAddress);

      if (!currency) {
        throw new Error('Paired currency not found');
      }

      const tokenPool = await getOrCreatePool(tx, {
        address: poolContext.address,
        tokenId: createdToken.id,
        currencyId: currency.id,
        isPrimary: true,
        feeBps: CLANKER_3_1_UNISWAP_FEE_BPS,
        athMcapUsd: poolContext.priceUsd * CLANKER_3_1_TOTAL_SUPPLY,
        startingMcapUsd: poolContext.priceUsd * CLANKER_3_1_TOTAL_SUPPLY
      });

      await redis.publish(INDEXING_POOLS_PUBSUB_CHANNEL, poolContext.address);
      console.log(`Published pool to channel ${INDEXING_POOLS_PUBSUB_CHANNEL}`);

      return {
        block,
        accountEntityId,
        token: createdToken,
        deployerContract,
        wallets,
        farcasterAccounts,
        xAccounts,
        tokenPool
      };
    });
  } finally {
    await dbPool.endPoolConnection();
  }
};
