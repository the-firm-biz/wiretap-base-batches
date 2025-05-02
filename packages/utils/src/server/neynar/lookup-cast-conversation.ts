import { isApiErrorResponse, NeynarAPIClient } from '@neynar/nodejs-sdk';
import type { CastWithInteractionsAndConversations } from '@neynar/nodejs-sdk/build/api/index.js';
import { callWithBackOff } from '../hof-helper/call-with-backoff.js';

/**
 * hhttps://docs.neynar.com/reference/lookup-cast-conversation
 */

export type NeynarCastWithInteractionsAndConversations =
  CastWithInteractionsAndConversations;

export async function lookupCastConversation(
  neynarClient: NeynarAPIClient,
  identifier: string
): Promise<NeynarCastWithInteractionsAndConversations | undefined> {
  try {
    const response = await neynarClient.lookupCastConversation({
      identifier,
      type: 'hash'
    });
    return response.conversation?.cast;
  } catch (error) {
    if (isApiErrorResponse(error)) {
      console.log(
        'neynarClient.lookupCastConversation:: API Error',
        error.response.data
      );
    } else {
      console.log('neynarClient.lookupCastConversation:: Generic Error', error);
    }
  }
}

export async function lookupCastConversationWithBackoff(
  neynarClient: NeynarAPIClient,
  identifier: string
): Promise<NeynarCastWithInteractionsAndConversations | undefined> {
  const castWithConversation = await callWithBackOff(
    () => lookupCastConversation(neynarClient, identifier),
    'lookupCastConversation'
  );
  if (!castWithConversation) {
    console.log(`No cast resolved for castHash ${identifier}`);
  }
  return castWithConversation;
}
