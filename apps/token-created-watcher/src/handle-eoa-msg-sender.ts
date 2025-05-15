import {
  fetchBulkUsersByEthOrSolAddress,
  getSingletonNeynarClient
} from '@wiretap/utils/server';
import { env } from './env.js';
import { commitTokenDetailsToDb } from './commits/commit-token-details-to-db.js';
import { handleTokenWithFarcasterUser } from './handle-token-with-farcaster-user.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import { sendSlackMessage } from './notifications/send-slack-message.js';
import { getTokenScore } from './token-score/get-token-score.js';
import type { DeployTokenArgs } from './get-transaction-context.js';
import { buyToken } from './token-buyer/index.js';

export async function handleEOAMsgSender(
  tokenCreatedData: TokenCreatedOnChainParams,
  transactionArgs: DeployTokenArgs
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

  let createdDbRows = undefined;
  if (!userResponse || userResponse.length === 0) {
    createdDbRows = await commitTokenDetailsToDb({
      tokenCreatedData,
      tokenCreatorAddress: tokenCreatedData.msgSender,
      tokenScore: null
    });
  } else {
    // Since we've checked userResponse is not empty, we can safely assert this is defined
    const neynarUser = userResponse[0]!;
    const tokenScoreDetails = await getTokenScore(neynarUser);
    createdDbRows = await handleTokenWithFarcasterUser(
      tokenCreatedData,
      tokenCreatedData.msgSender,
      neynarUser,
      tokenScoreDetails
    );
  }

  // TODO: try to call before const createdDbRows
  buyToken(tokenCreatedData.tokenAddress);

  sendSlackMessage({
    tokenAddress: createdDbRows.token.address,
    transactionHash: createdDbRows.token.deploymentTransactionHash,
    tokenName: createdDbRows.token.name,
    tokenSymbol: createdDbRows.token.symbol,
    deployerContractAddress: createdDbRows.deployerContract.address,
    tracing: {
      latencyMs: tokenCreatedData.block.timestamp
        ? createdDbRows.token.createdAt.getTime() -
          tokenCreatedData.block.timestamp?.getTime()
        : undefined
    },
    source: 'handle-eoa-msg-sender',
    tokenScoreDetails: null,
    transactionArgs
  });
}
