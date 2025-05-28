import { env } from '../env.js';
import {
  type Contract,
  createBlock,
  getCurrency,
  getOrCreateDeployerContract,
  getOrCreatePool,
  getOrCreateToken,
  PooledDbConnection,
  type Token,
  type Pool,
  countTokensByCreator
} from '@wiretap/db';
import type { TokenCreatedOnChainParams } from '../types/token-created.js';
import type { MinimalBlock } from '../types/block.js';
import { getRedis } from '@wiretap/redis';
import {
  CLANKER_3_1_UNISWAP_FEE_BPS,
  CLANKER_3_1_TOTAL_SUPPLY,
  INDEXING_POOLS_PUBSUB_CHANNEL
} from '@wiretap/config';

export type CommitTokenDetailsToDbParams = {
  tokenCreatedData: TokenCreatedOnChainParams;
  tokenScore: number | null;
  imageUrl?: string;
  accountEntityId: number;
};

export type CommitTokenDetailsToDbResult = {
  block: MinimalBlock;
  token: Token;
  deployerContract: Contract;
  tokenPool: Pool;
};

/**
 * Saves token details to the DB
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
  accountEntityId,
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

      await createBlock(tx, {
        number: block.number,
        timestamp: block.timestamp
      });

      // @todo - handle potential race condition here
      const creatorTokenIndex = await countTokensByCreator(tx, accountEntityId);

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
        imageUrl,
        creatorTokenIndex
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
        token: createdToken,
        deployerContract,
        tokenPool
      };
    });
  } finally {
    await dbPool.endPoolConnection();
  }
};
