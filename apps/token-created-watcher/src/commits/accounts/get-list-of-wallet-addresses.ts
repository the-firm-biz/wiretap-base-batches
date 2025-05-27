import type { NeynarUser } from '@wiretap/utils/server';
import { isAddressEqual } from '@wiretap/utils/shared';
import type { Address } from 'viem';

/** Returns the list of all wallets to be checked or created */
export const getListOfWalletAddresses = (
  tokenCreatorAddress: Address | null,
  neynarUser?: NeynarUser
): Address[] => {
  if (!tokenCreatorAddress && !neynarUser) {
    return [];
  }

  const allWallets = tokenCreatorAddress ? [tokenCreatorAddress] : [];

  if (!neynarUser) {
    return allWallets;
  }

  const neynarEthWallets = neynarUser.verified_addresses.eth_addresses;
  return neynarEthWallets.reduce((acc, cur) => {
    if (!acc.some((w) => isAddressEqual(w, cur))) {
      acc.push(cur as Address);
    }
    return acc;
  }, allWallets);
};
