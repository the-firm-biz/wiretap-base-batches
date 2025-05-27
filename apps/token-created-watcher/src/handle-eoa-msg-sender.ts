import {
  fetchBulkUsersByEthOrSolAddress,
  getSingletonNeynarClient
} from '@wiretap/utils/server';
import { env } from './env.js';
import { commitTokenDetailsToDb } from './commits/commit-token-details-to-db.js';
import { getAccountEntityIdWithNeynarUserAndAddress } from './get-account-entity-id-with-neynar-user-and-address.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import { sendSlackMessage } from './notifications/send-slack-message.js';
import {
  getTokenScore,
  type TokenScoreDetails
} from './token-score/get-token-score.js';
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
  let accountEntityId = undefined;
  let tokenScoreDetails: TokenScoreDetails | null = null;

  if (!userResponse || userResponse.length === 0) {
    // @todo jeff migrate to fetch account entity id for address
    createdDbRows = await commitTokenDetailsToDb({
      tokenCreatedData,
      tokenCreatorAddress: tokenCreatedData.msgSender,
      tokenScore: null,
      imageUrl: transactionArgs?.tokenConfig?.image
    });
  } else {
    // Since we've checked userResponse is not empty, we can safely assert this is defined
    const neynarUser = userResponse[0]!;
    accountEntityId = await getAccountEntityIdWithNeynarUserAndAddress({
      neynarUser,
      tokenCreatorAddress: tokenCreatedData.msgSender
    });
  }

  // @todo jeff insert token using accountEntityId

  // @todo jeff: migrate to use accountEntityId
  buyToken(tokenCreatedData.tokenAddress, tokenCreatedData.poolContext.address);

  if (userResponse[0]) {
    tokenScoreDetails = await getTokenScore(userResponse[0]);
  }

  // @todo jeff create tokens and get data for logging
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
    tokenScoreDetails,
    transactionArgs
  });
}
