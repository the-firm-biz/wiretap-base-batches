import { isApiErrorResponse, NeynarAPIClient } from '@neynar/nodejs-sdk';
import type { NeynarSearchedUser } from './types.js';

/**
 * https://docs.neynar.com/reference/search-user
 */
export async function searchByUsername(
  neynarClient: NeynarAPIClient,
  username: string,
  cursor?: string
): Promise<{
  users: NeynarSearchedUser[];
  nextCursor?: string;
}> {
  try {
    const response = await neynarClient.searchUser({
      q: username,
      limit: 10,
      cursor: cursor
    });
    return {
      users: response.result.users,
      nextCursor: response.result.next?.cursor ?? undefined
    };
  } catch (error) {
    if (isApiErrorResponse(error)) {
      console.log(
        'neynarClient.searchByUsername:: API Error',
        error.response.data
      );
    } else {
      console.log('neynarClient.searchByUsername:: Generic Error', error);
    }
    return {
      users: [],
      nextCursor: undefined
    };
  }
}
