import { isApiErrorResponse, NeynarAPIClient } from '@neynar/nodejs-sdk';
import type { CastWithInteractionsAndConversations } from '@neynar/nodejs-sdk/build/api/index.js';
import { backOff } from 'exponential-backoff';
import { throwOnUnknownResult } from './assure_result.js';

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
  try {
    return await backOff(
      () =>
        throwOnUnknownResult(lookupCastConversation)(neynarClient, identifier),
      {
        retry: (_, attemptNumber) => {
          console.log(`retry #${attemptNumber} to fetch cast ${identifier}`);
          return true;
        },
        jitter: 'full'
      }
    );
  } catch (error) {
    console.error(`Failed to fetch cast ${identifier}`, error);
  }
}
