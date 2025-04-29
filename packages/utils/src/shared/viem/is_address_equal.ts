import { getAddress } from 'viem';

type Stringish = string | undefined | null;

/**
 * Evaluates for falsy addresses and then compares whether two checksummed addresses are equal
 * @NOTE Equivalent to Viem's helper function but without the Address type requirement https://viem.sh/docs/utilities/isAddressEqual.html
 * @param address1
 * @param address2
 * @returns {boolean}
 */
export const isAddressEqual = (address1: Stringish, address2: Stringish) => {
  if (!address1 || !address2) {
    return false;
  }

  try {
    return getAddress(address1) === getAddress(address2);
  } catch {
    return false;
  }
};
