import { isApiErrorResponse, NeynarAPIClient } from '@neynar/nodejs-sdk';

/**
 * https://docs.neynar.com/reference/fetch-bulk-users
 */
export async function fetchBulkUsers(
  neynarClient: NeynarAPIClient,
  fids: string[] | number[]
) {
  try {
    const response = await neynarClient.fetchBulkUsers({
      fids: fids.map(Number)
    });
    return response.users;
  } catch (error) {
    if (isApiErrorResponse(error)) {
      console.log(
        'neynarClient.fetchBulkUsers:: API Error',
        error.response.data
      );
    } else {
      console.log('neynarClient.fetchBulkUsers:: Generic Error', error);
    }
  }
}
