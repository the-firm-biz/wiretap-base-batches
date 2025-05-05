import type { NeynarUser } from '@wiretap/utils/server';
import { commitTokenDetailsToDb } from './commits/commit-token-details-to-db.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import type { Address } from 'viem';
import { sendSlackMessage } from './notifications/send-slack-message.js';
import { sendSlackIndexerError } from './notifications/send-slack-indexer-error.js';

export async function handleTokenWithFarcasterUser(
  tokenCreatedData: TokenCreatedOnChainParams,
  tokenCreatorAddress: Address,
  neynarUser: NeynarUser
) {
  // [3 concurrent]
  // TODO: find users monitoring accountEntities connected to response's farcasterAccounts, wallets or xAccounts

  // [4 concurrent]
  try {
    const createdDbRows = await commitTokenDetailsToDb({
      tokenCreatedData,
      tokenCreatorAddress,
      neynarUser
    });
    sendSlackMessage({
      tokenAddress: createdDbRows.token.address,
      transactionHash: createdDbRows.token.deploymentTransactionHash,
      tokenName: createdDbRows.token.name,
      tokenSymbol: createdDbRows.token.symbol,
      deployerContractAddress: createdDbRows.deployerContract.address,
      neynarUser,
      latencyMs: tokenCreatedData.block.timestamp
        ? createdDbRows.token.createdAt.getTime() -
          tokenCreatedData.block.timestamp?.getTime()
        : undefined,
      source: 'handle-eoa-msg-sender'
    });
    return createdDbRows;
  } catch (error) {
    sendSlackIndexerError(error);
  }
}
