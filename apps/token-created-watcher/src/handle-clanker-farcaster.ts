import {
  fetchBulkUsers,
  getSingletonNeynarClient,
  lookupCastConversationWithBackoff
} from '@wiretap/utils/server';
import { env } from './env.js';
import { handleTokenWithFarcasterUser } from './handle-token-with-farcaster-user.js';
import type { TokenCreatedOnChainParams } from './types/token-created.js';
import {
  validateAuthorFid,
  type validateCastFn,
  validateDirectReplies
} from './handle-clanker-farcaster-validation.js';
import type { Address } from 'viem';
import { sendSlackMessage } from './notifications/send-slack-message.js';
import { getTokenScore } from './token-score/get-token-score.js';

export interface HandleClankerFarcasterArgs {
  fid: number;
  messageId: string;
}

export async function handleClankerFarcaster(
  tokenCreatedData: TokenCreatedOnChainParams,
  clankerFarcasterArgs: HandleClankerFarcasterArgs
) {
  const { messageId: castHash } = clankerFarcasterArgs;

  const neynarClient = getSingletonNeynarClient({
    apiKey: env.NEYNAR_API_KEY
  });

  const castAndConversations = await lookupCastConversationWithBackoff(
    neynarClient,
    castHash
  );

  let isValidCast = false;

  if (castAndConversations) {
    isValidCast = [validateAuthorFid, validateDirectReplies].every(
      (fn: validateCastFn) =>
        fn(castAndConversations, clankerFarcasterArgs, tokenCreatedData)
    );
  }

  // TODO: write missing neynar data to DB
  const userResponse = await fetchBulkUsers(neynarClient, [
    clankerFarcasterArgs.fid
  ]);

  const neynarUser =
    userResponse && userResponse.length > 0 ? userResponse[0] : undefined;

  const tokenScoreDetails = neynarUser ? await getTokenScore(neynarUser) : null;

  if (castAndConversations && isValidCast) {
    await handleTokenWithFarcasterUser(
      tokenCreatedData,
      {
        fid: clankerFarcasterArgs.fid,
        username: castAndConversations.author.username,
        address: castAndConversations.author.verified_addresses
          .eth_addresses[0] as Address // todo: process entire array of addresses
      },
      tokenScoreDetails?.tokenScore ?? null
    );
  }

  sendSlackMessage({
    tokenAddress: tokenCreatedData.tokenAddress,
    transactionHash: tokenCreatedData.transactionHash,
    tokenName: tokenCreatedData.tokenName,
    tokenSymbol: tokenCreatedData.symbol,
    deployerContractAddress: tokenCreatedData.deployerContractAddress,
    neynarUser,
    source: 'handle-clanker-farcaster',
    castValidation: {
      exists: !!castAndConversations,
      isValid: isValidCast
    },
    tokenScoreDetails
  });
}
