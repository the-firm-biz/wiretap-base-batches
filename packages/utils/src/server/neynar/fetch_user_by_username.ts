import { isApiErrorResponse, NeynarAPIClient } from '@neynar/nodejs-sdk';
import type { NeynarUser } from './types.js';

/**
 * https://docs.neynar.com/reference/lookup-user-by-username
 */
export async function fetchUserByUsername(
  neynarClient: NeynarAPIClient,
  username: string
): Promise<NeynarUser | undefined> {
  try {
    const response = await neynarClient.lookupUserByUsername({ username });
    return response.user;
  } catch (error) {
    if (isApiErrorResponse(error)) {
      console.log(
        'neynarClient.fetchUserByUsername:: API Error',
        error.response.data
      );
    } else {
      console.log('neynarClient.fetchUserByUsername:: Generic Error', error);
    }
  }
}
