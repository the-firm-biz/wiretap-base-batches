import { isApiErrorResponse, NeynarAPIClient } from '@neynar/nodejs-sdk';

/**
 * https://docs.neynar.com/reference/fetch-bulk-users-by-eth-or-sol-address
 */
export async function fetchBulkUsersByEthOrSolAddress(
  neynarClient: NeynarAPIClient,
  addresses: string[]
) {
  try {
    const response = await neynarClient.fetchBulkUsersByEthOrSolAddress({
      addresses
    });
    return response.users;
  } catch (error) {
    if (isApiErrorResponse(error)) {
      if (error.status === 404) {
        return []; // Neynar throws with 404 if user doesn't exist
      }
      console.log(
        `neynarClient.fetchBulkUsersByEthOrSolAddress:: API Error ${error.status}`,
        error.response.data
      );
    } else {
      console.log(
        'neynarClient.fetchBulkUsersByEthOrSolAddress:: Generic Error',
        error
      );
    }
    throw error;
  }
}
