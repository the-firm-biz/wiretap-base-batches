import type { Log } from 'viem';
import { CLANKER_3_1_ADDRESS, CLANKER_3_1_ABI } from '@wiretap/config';
import { isAddressEqual } from '@wiretap/utils/shared';
import { decodeEventLog } from 'viem';

/**
 * Checks if a log is a Clanker 3.1 TokenCreated event
 */
export function isClankerV3_1TokenCreatedLog(log: Log): boolean {
  // Check if the log is from the Clanker 3.1 contract
  if (!isAddressEqual(log.address, CLANKER_3_1_ADDRESS)) {
    return false;
  }

  try {
    // Try to decode the log as a TokenCreated event using the Clanker ABI
    const decoded = decodeEventLog({
      abi: CLANKER_3_1_ABI,
      data: log.data,
      topics: log.topics
    });

    // Check if it's specifically a TokenCreated event
    return decoded.eventName === 'TokenCreated';
  } catch {
    // If decoding fails, it's not a TokenCreated event
    return false;
  }
}
