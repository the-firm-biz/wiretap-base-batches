import { callWithBackOff, lookupCastConversation } from '@wiretap/utils/server';
import type {
  NeynarAPIClient,
  NeynarCastWithInteractionsAndConversations
} from '@wiretap/utils/server';
import type { Context } from '@wiretap/utils/shared';
import type { HandleClankerFarcasterArgs } from '../../handle-clanker-farcaster.js';
import type { TokenCreatedOnChainParams } from '../../types/token-created.js';
import {
  validateAuthorFid,
  validateDirectReplies
} from './cast-validator-fns.js';

type CastWithValidation = {
  castAndConversations: NeynarCastWithInteractionsAndConversations | undefined;
  isValidCast: boolean;
};

export async function lookupAndValidateCastConversationWithBackoff(
  neynarClient: NeynarAPIClient,
  tokenCreatedData: TokenCreatedOnChainParams,
  clankerFarcasterArgs: HandleClankerFarcasterArgs,
  { tracing }: Context
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
    }
  );

  return (
    castWithValidation ?? {
      castAndConversations: undefined,
      isValidCast: false
    }
  );
}
