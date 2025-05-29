import type { Log } from 'viem';
import { UNISWAP_POOL_V3_ABI } from '@wiretap/config';
import { decodeEventLog } from 'viem';

/**
 * Checks if a log is a Uniswap V3 Swap event
 */
export function isUniswapV3SwapLog(log: Log): boolean {
  try {
    // Try to decode the log as a Swap event using the Uniswap Pool V3 ABI
    const decoded = decodeEventLog({
      abi: UNISWAP_POOL_V3_ABI,
      data: log.data,
      topics: log.topics
    });

    // Check if it's specifically a Swap event
    return decoded.eventName === 'Swap';
  } catch {
    // If decoding fails, it's not a Swap event
    return false;
  }
}
