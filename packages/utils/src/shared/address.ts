import type { Address } from 'viem';

export function lowercaseAddress(address: Address): Address {
  return address.toLowerCase() as Address;
}
