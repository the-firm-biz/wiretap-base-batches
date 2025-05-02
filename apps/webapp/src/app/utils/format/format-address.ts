import { type Address } from 'viem';

/**
 * Format an address for display
 * @param address
 * @param startLength length before "..."
 * @param endLength length after "..."
 * @returns string
 */
export const formatAddress = (
  address: Address | string,
  startLength = 4,
  endLength = 4
): string =>
  `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
