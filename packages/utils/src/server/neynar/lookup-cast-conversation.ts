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
): Promise<NeynarCastWithInteractionsAndConversations> {
  try {
    const response = await neynarClient.lookupCastConversation({
      identifier,
      type: 'hash'
    });
    const cast = response.conversation?.cast;
    if (cast) {
      return cast;
    }
  } catch (error) {
    if (isApiErrorResponse(error)) {
      console.log(
        'neynarClient.lookupCastConversation:: API Error',
        error.response.data
      );
    } else {
      console.log('neynarClient.lookupCastConversation:: Generic Error', error);
    }
    throw error;
  }
  throw new Error(`no cast response for identifier ${identifier}`);
}
