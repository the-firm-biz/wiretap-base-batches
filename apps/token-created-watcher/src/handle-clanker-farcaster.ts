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

  const userResponse = await fetchBulkUsers(neynarClient, [
    clankerFarcasterArgs.fid
  ]);

  const neynarUser =
    userResponse && userResponse.length > 0 ? userResponse[0] : undefined;

  let latencyMs: number | undefined = undefined;

  if (castAndConversations && isValidCast && neynarUser) {
    const tokenCreatorAddress = neynarUser.verified_addresses.primary
      .eth_address as Address;
    const createdDbRows = await handleTokenWithFarcasterUser(
      tokenCreatedData,
      tokenCreatorAddress,
      neynarUser
    );

    latencyMs = tokenCreatedData.block.timestamp
      ? createdDbRows.token.createdAt.getTime() -
        tokenCreatedData.block.timestamp?.getTime()
      : undefined;
  }

  // TODO: add neynarUser to castValidation log

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
      exists: !!castAndConversations,
      isValid: isValidCast
    }
  });
}
