import {
  fetchBulkUsersByEthOrSolAddress,
  getSingletonNeynarClient
} from '@wiretap/utils/server';
import { env } from './env.js';
import { commitTokenDetailsToDb } from './commits/commit-token-details-to-db.js';
import { handleTokenWithFarcasterUser } from './handle-token-with-farcaster-user.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import { sendSlackMessage } from './notifications/send-slack-message.js';
import { sendSlackIndexerError } from './notifications/send-slack-indexer-error.js';

export async function handleEOAMsgSender(
  tokenCreatedData: TokenCreatedOnChainParams
) {
  // [1 concurrent]
  // TODO: find msgSender in wallets table
  // TODO: find users monitoring that tokenCreatedEntity

  // [2 concurrent]
  const neynarClient = getSingletonNeynarClient({
    apiKey: env.NEYNAR_API_KEY
  });
  const userResponse = await fetchBulkUsersByEthOrSolAddress(neynarClient, [
    tokenCreatedData.msgSender
  ]);

  if (!userResponse || userResponse.length === 0) {
    // [4 concurrent]
    try {
      const result = await commitTokenDetailsToDb({
        tokenCreatedData,
        tokenCreatorAddress: tokenCreatedData.msgSender
      });
      sendSlackMessage({
        tokenAddress: result.token.address,
        transactionHash: result.token.deploymentTransactionHash,
        tokenName: result.token.name,
        tokenSymbol: result.token.symbol,
        deployerContractAddress: result.deployerContract.address,
        latencyMs: tokenCreatedData.block.timestamp
          ? result.token.createdAt.getTime() -
            tokenCreatedData.block.timestamp?.getTime()
          : undefined,
        source: 'handle-eoa-msg-sender'
      });
    } catch (error) {
      sendSlackIndexerError(error);
    }
    return;
  }

  // Since we've checked userResponse is not empty, we can safely assert this is defined
  const neynarUser = userResponse[0]!;

  await handleTokenWithFarcasterUser(
    tokenCreatedData,
    tokenCreatedData.msgSender,
    neynarUser
  );
}
