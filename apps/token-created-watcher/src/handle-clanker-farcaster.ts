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
import { TokenIndexerError } from './errors.js';
import { type Context, trace } from '@wiretap/utils/shared';

export interface HandleClankerFarcasterArgs {
  fid: number;
  messageId: string;
}

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
        { tracing: { parentSpan: span } },
      ),
    {
      name: 'lookupAndValidateCastConversationWithBackoff',
      parentSpan
    }
  );

  const neynarUser = castAndConversations?.author;

  let latencyMs: number | undefined = undefined;
  const tokenScoreDetails = neynarUser
    ? await trace(() => getTokenScore(neynarUser), {
        name: 'getTokenScore',
        parentSpan
      })
    : null;

  if (castAndConversations && isValidCast && neynarUser) {
    const tokenCreatorAddress = neynarUser.verified_addresses.primary
      .eth_address as Address;
    if (!tokenCreatorAddress) {
      throw new TokenIndexerError(
        'neynarUser without verified primary address',
        'handleClankerFarcaster',
        {
          neynarUser: neynarUser,
          cast: clankerFarcasterArgs.messageId
        }
      );
    }
    const createdDbRows = await trace(
      () =>
        handleTokenWithFarcasterUser(
          tokenCreatedData,
          tokenCreatorAddress,
          neynarUser,
          tokenScoreDetails
        ),
      {
        name: 'handleTokenWithFarcasterUser',
        parentSpan
      }
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

type CastWithValidation = {
  castAndConversations: NeynarCastWithInteractionsAndConversations | undefined;
  isValidCast: boolean;
};

async function lookupAndValidateCastConversationWithBackoff(
  neynarClient: NeynarAPIClient,
  tokenCreatedData: TokenCreatedOnChainParams,
  clankerFarcasterArgs: HandleClankerFarcasterArgs,
  { tracing }: Context,
): Promise<CastWithValidation> {
  const { messageId: castHash } = clankerFarcasterArgs;

  const castWithValidation = await callWithBackOff(
    async () => {
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
    },
    {
      startingDelay: 500,
      timeMultiple: 1.3
    },
    {
      name: 'lookupAndValidateCastConversation',
      tracing
    },
  );

  return (
    castWithValidation ?? {
      castAndConversations: undefined,
      isValidCast: false
    }
  );
}
