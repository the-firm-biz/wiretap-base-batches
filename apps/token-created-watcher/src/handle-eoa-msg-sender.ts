import {
  fetchBulkUsersByEthOrSolAddress,
  getSingletonNeynarClient
} from '@wiretap/utils/server';
import { env } from './env.js';
import { commitTokenDetailsToDb } from './helpers/commit-token-details-to-db.js';
import { getAccountEntityIdWithNeynarUserAndAddress } from './helpers/accounts/get-account-entity-id-with-neynar-user-and-address.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import { sendSlackMessage } from './helpers/notifications/send-slack-message.js';
import { getTokenScore } from './helpers/token-score/get-token-score.js';
import type { DeployTokenArgs } from './helpers/get-transaction-context.js';
import { buyToken } from './helpers/token-buying/index.js';
import { getAccountEntityIdForAddress } from './helpers/accounts/get-account-entity-id-for-address.js';

/** Called when the msgSender of the Clanker TokenCreated event is an EOA. */
export async function handleEOAMsgSender(
  tokenCreatedData: TokenCreatedOnChainParams,
  transactionArgs: DeployTokenArgs
) {
  // TODO: [concurrency]

  // Concurrent Promise 1.
  // getAccountEntityIdForAddress for msgSender immediately (note - do not write to db to simplify race conditions)
  // if accountEntityId is found, find users monitoring that accountEntityId
  // attempt buy

  // Concurrent Promise 2.
  // fetchBulkUsersByEthOrSolAddress
  // getAccountEntityIdWithNeynarUserAndAddress (note - do not write to db to simplify race conditions)
  // if accountEntityId is found, find users monitoring that accountEntityId
  // attempt buy

  //  Finally.
  //  getTokenScore
  //  commitTokenDetailsToDb
  //  sendSlackMessage

  const neynarClient = getSingletonNeynarClient({
    apiKey: env.NEYNAR_API_KEY
  });
  const userResponse = await fetchBulkUsersByEthOrSolAddress(neynarClient, [
    tokenCreatedData.msgSender
  ]);
  const neynarUser = userResponse && userResponse[0];

  let accountEntityId: number | undefined = undefined;

  if (!neynarUser) {
    accountEntityId = await getAccountEntityIdForAddress({
      tokenCreatorAddress: tokenCreatedData.msgSender
    });
  } else {
    accountEntityId = await getAccountEntityIdWithNeynarUserAndAddress({
      neynarUser,
      tokenCreatorAddress: tokenCreatedData.msgSender
    });
  }

  const tokenScoreDetails = await getTokenScore({
    accountEntityId,
    neynarUserScore: neynarUser?.experimental?.neynar_user_score,
    neynarUserFollowersCount: neynarUser?.follower_count
  });

  const createdDbRows = await commitTokenDetailsToDb({
    tokenCreatedData,
    accountEntityId,
    tokenScore: tokenScoreDetails?.tokenScore,
    imageUrl: transactionArgs?.tokenConfig?.image
  });

  // @todo jeff: migrate to use accountEntityId and call sooner
  buyToken(tokenCreatedData.tokenAddress, tokenCreatedData.poolContext.address);

  const latencyMs = tokenCreatedData.block.timestamp
    ? createdDbRows.token.createdAt.getTime() -
      tokenCreatedData.block.timestamp?.getTime()
    : null;

  sendSlackMessage({
    tokenAddress: createdDbRows.token.address,
    transactionHash: createdDbRows.token.deploymentTransactionHash,
    tokenName: createdDbRows.token.name,
    tokenSymbol: createdDbRows.token.symbol,
    deployerContractAddress: createdDbRows.deployerContract.address,
    tracing: {
      latencyMs
    },
    source: 'handle-eoa-msg-sender',
    tokenScoreDetails,
    transactionArgs
  });
}
