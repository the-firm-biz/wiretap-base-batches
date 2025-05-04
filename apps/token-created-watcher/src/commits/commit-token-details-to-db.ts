import { env } from '../env.js';
import {
  getOrCreateDeployerContract,
  getOrCreateToken,
  PooledDbConnection,
  createBlock,
  type Contract,
  type FarcasterAccount,
  type Token,
  type Wallet,
  type XAccount
} from '@wiretap/db';
import type { TokenCreatedOnChainParams } from '../types/token-created.js';
import type { Address } from 'viem';
import type { NeynarUser } from '@wiretap/utils/server';
import { commitAccountInfoToDb } from './commit-account-info-to-db.js';
import type { Block } from '../types/block.js';

export type CommitTokenDetailsToDbParams = {
  tokenCreatedData: TokenCreatedOnChainParams;
  tokenCreatorAddress: Address;
  neynarUser?: NeynarUser;
};

export type CommitTokenDetailsToDbResult = {
  block: Block;
  accountEntityId: number;
  token: Token;
  deployerContract: Contract;
  wallets: Wallet[];
  farcasterAccounts: FarcasterAccount[];
  xAccounts: XAccount[];
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
    block
  },
  tokenCreatorAddress,
  neynarUser
}: CommitTokenDetailsToDbParams): Promise<CommitTokenDetailsToDbResult> => {
  const dbPool = new PooledDbConnection({ databaseUrl: env.DATABASE_URL });

  try {
    const deployerContract = await getOrCreateDeployerContract(dbPool.db, {
      address: deployerContractAddress
    });

    const { accountEntityId, wallets, farcasterAccounts, xAccounts } =
      await commitAccountInfoToDb(dbPool.db, {
        tokenCreatorAddress,
        neynarUser
      });

    await createBlock(dbPool.db, {
      number: block.number,
      timestamp: block.timestamp
    });

    const createdToken = await getOrCreateToken(dbPool.db, {
      address: tokenAddress,
      deploymentContractId: deployerContract.id,
      deploymentTransactionHash: transactionHash,
      accountEntityId,
      symbol,
      name: tokenName,
      block: block.number
    });

    return {
      block,
      accountEntityId,
      token: createdToken,
      deployerContract,
      wallets,
      farcasterAccounts,
      xAccounts
    };
  } finally {
    await dbPool.endPoolConnection();
  }
};
