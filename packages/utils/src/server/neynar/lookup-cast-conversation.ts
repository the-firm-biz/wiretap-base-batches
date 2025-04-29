import { isApiErrorResponse, NeynarAPIClient } from '@neynar/nodejs-sdk';
import type { CastWithInteractionsAndConversations } from '@neynar/nodejs-sdk/build/api/index.js';

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
