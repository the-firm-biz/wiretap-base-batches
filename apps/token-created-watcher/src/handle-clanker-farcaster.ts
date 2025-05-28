import { getSingletonNeynarClient } from '@wiretap/utils/server';
import { env } from './env.js';
import { getAccountEntityIdWithNeynarUserAndAddress } from './helpers/accounts/get-account-entity-id-with-neynar-user-and-address.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import type { Address } from 'viem';
import { sendSlackMessage } from './helpers/notifications/send-slack-message.js';
import {
  getTokenScore,
  type TokenScoreDetails
} from './helpers/token-score/get-token-score.js';
import type { DeployTokenArgs } from './helpers/get-transaction-context.js';
import { type Context, trace } from '@wiretap/utils/shared';
import { buyToken } from './helpers/token-buying/index.js';
import { commitTokenDetailsToDb } from './helpers/commit-token-details-to-db.js';
import { lookupAndValidateCastConversationWithBackoff } from './helpers/cast-validation/lookup-and-validate-cast-conversation-with-backoff.js';

export interface HandleClankerFarcasterArgs {
  fid: number;
  messageId: string;
}

/**
 * Called when we expect a Clanker token has been deployed by @ing Clanker on Farcaster.
 */
export async function handleClankerFarcaster(
  tokenCreatedData: TokenCreatedOnChainParams,
  clankerFarcasterArgs: HandleClankerFarcasterArgs,
  transactionArgs: DeployTokenArgs,
  { tracing: { parentSpan } = {} }: Context
) {
  const neynarClient = getSingletonNeynarClient({
    apiKey: env.NEYNAR_API_KEY
  });

  const { castAndConversations, isValidCast } = await trace(
    (span) =>
      lookupAndValidateCastConversationWithBackoff(
        neynarClient,
        tokenCreatedData,
        clankerFarcasterArgs,
        { tracing: { parentSpan: span } }
      ),
    {
      name: 'lookupAndValidateCastConversationWithBackoff',
      parentSpan
    }
  );

  const neynarUser = castAndConversations?.author;

  let latencyMs: number | null = null;
  let tokenScoreDetails: TokenScoreDetails | null = null;

  if (castAndConversations && isValidCast && neynarUser) {
    const primaryAddress = neynarUser.verified_addresses.primary?.eth_address;
    const otherAddresses = neynarUser.verified_addresses.eth_addresses;
    const tokenCreatorAddress = (primaryAddress ||
      otherAddresses[0]) as Address | null;

    const accountEntityId = await trace(
      () =>
        getAccountEntityIdWithNeynarUserAndAddress({
          tokenCreatorAddress,
          neynarUser
        }),
      {
        name: 'getAccountEntityIdWithNeynarUserAndAddress',
        parentSpan
      }
    );

    tokenScoreDetails = await trace(
      () =>
        getTokenScore({
          accountEntityId,
          neynarUserScore: neynarUser?.experimental?.neynar_user_score,
          neynarUserFollowersCount: neynarUser?.follower_count
        }),
      {
        name: 'getTokenScore',
        parentSpan
      }
    );

    const createdDbRows = await trace(
      () =>
        commitTokenDetailsToDb({
          tokenCreatedData,
          accountEntityId,
          tokenScore: tokenScoreDetails?.tokenScore ?? null,
          imageUrl: transactionArgs?.tokenConfig?.image
        }),
      {
        name: 'commitTokenDetailsToDb',
        parentSpan
      }
    );

    // @todo jeff: migrate to use accountEntityId and call sooner
    buyToken(
      tokenCreatedData.tokenAddress,
      tokenCreatedData.poolContext.address
    );

    latencyMs =
      createdDbRows && tokenCreatedData.block.timestamp
        ? createdDbRows.token.createdAt.getTime() -
          tokenCreatedData.block.timestamp?.getTime()
        : null;
  }

  sendSlackMessage({
    tokenAddress: tokenCreatedData.tokenAddress,
    transactionHash: tokenCreatedData.transactionHash,
    tokenName: tokenCreatedData.tokenName,
    tokenSymbol: tokenCreatedData.symbol,
    deployerContractAddress: tokenCreatedData.deployerContractAddress,
    neynarUser,
    tracing: {
      latencyMs,
      span: parentSpan?.root()
    },
    source: 'handle-clanker-farcaster',
    castValidation: {
      castExists: !!castAndConversations,
      castIsValid: isValidCast,
      neynarUserExists: !!neynarUser
    },
    tokenScoreDetails,
    transactionArgs
  });
}
