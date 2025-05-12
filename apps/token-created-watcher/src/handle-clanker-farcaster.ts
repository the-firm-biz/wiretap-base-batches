import {
  callWithBackOff,
  getSingletonNeynarClient,
  lookupCastConversation,
  type NeynarAPIClient,
  type NeynarCastWithInteractionsAndConversations
} from '@wiretap/utils/server';
import { env } from './env.js';
import { handleTokenWithFarcasterUser } from './handle-token-with-farcaster-user.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import {
  validateAuthorFid,
  validateDirectReplies
} from './handle-clanker-farcaster-validation.js';
import type { Address } from 'viem';
import { sendSlackMessage } from './notifications/send-slack-message.js';
import { getTokenScore } from './token-score/get-token-score.js';
import type { DeployTokenArgs } from './get-transaction-context.js';
export interface HandleClankerFarcasterArgs {
  fid: number;
  messageId: string;
}

export async function handleClankerFarcaster(
  tokenCreatedData: TokenCreatedOnChainParams,
  clankerFarcasterArgs: HandleClankerFarcasterArgs,
  transactionArgs: DeployTokenArgs
) {
  const neynarClient = getSingletonNeynarClient({
    apiKey: env.NEYNAR_API_KEY
  });

  const { castAndConversations, isValidCast } =
    await lookupAndValidateCastConversationWithBackoff(
      neynarClient,
      tokenCreatedData,
      clankerFarcasterArgs
    );

  const neynarUser = castAndConversations?.author;

  let latencyMs: number | undefined = undefined;
  const tokenScoreDetails = neynarUser ? await getTokenScore(neynarUser) : null;

  if (castAndConversations && isValidCast && neynarUser) {
    const tokenCreatorAddress = castAndConversations?.author.verified_addresses
      .primary.eth_address as Address;
    const createdDbRows = await handleTokenWithFarcasterUser(
      tokenCreatedData,
      tokenCreatorAddress,
      neynarUser,
      tokenScoreDetails
    );

    latencyMs =
      createdDbRows && tokenCreatedData.block.timestamp
        ? createdDbRows.token.createdAt.getTime() -
          tokenCreatedData.block.timestamp?.getTime()
        : undefined;
  }

  sendSlackMessage({
    tokenAddress: tokenCreatedData.tokenAddress,
    transactionHash: tokenCreatedData.transactionHash,
    tokenName: tokenCreatedData.tokenName,
    tokenSymbol: tokenCreatedData.symbol,
    deployerContractAddress: tokenCreatedData.deployerContractAddress,
    neynarUser,
    latencyMs,
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

type CastWithValidation = {
  castAndConversations: NeynarCastWithInteractionsAndConversations | undefined;
  isValidCast: boolean;
};

async function lookupAndValidateCastConversationWithBackoff(
  neynarClient: NeynarAPIClient,
  tokenCreatedData: TokenCreatedOnChainParams,
  clankerFarcasterArgs: HandleClankerFarcasterArgs
): Promise<CastWithValidation> {
  const { messageId: castHash } = clankerFarcasterArgs;

  const castWithValidation = await callWithBackOff(async () => {
    const castAndConversations = await lookupCastConversation(
      neynarClient,
      castHash
    );

    if (!castAndConversations) {
      throw new Error('No Cast was fetched');
    }

    const isFidValid = validateAuthorFid(
      castAndConversations,
      clankerFarcasterArgs,
      tokenCreatedData
    );
    if (!isFidValid) {
      // no need to retry as fid validation went wrong
      return { castAndConversations, isValidCast: false };
    }

    const areDirectRepliesValid = validateDirectReplies(
      castAndConversations,
      clankerFarcasterArgs,
      tokenCreatedData
    );
    if (!areDirectRepliesValid) {
      // cause retry to cover cases when direct reply is delayed
      throw new Error('Cast Direct Reply validation failed, try again');
    }

    return { castAndConversations, isValidCast: true };
  }, 'lookupAndValidateCastConversationWithBackoff');

  return (
    castWithValidation ?? {
      castAndConversations: undefined,
      isValidCast: false
    }
  );
}
