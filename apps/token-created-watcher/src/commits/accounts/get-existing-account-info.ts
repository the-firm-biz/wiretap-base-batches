import { getWallets, getXAccounts, getFarcasterAccount } from '@wiretap/db';
import type { ServerlessDb } from '@wiretap/db';
import type { XAccount, Wallet, FarcasterAccount } from '@wiretap/db';
import type { NeynarUser } from '@wiretap/utils/server';
import type { Address } from 'viem';
import { getListOfWalletAddresses } from './get-list-of-wallet-addresses.js';
import { getXAccountsFromNeynarUser } from './get-x-accounts-from-neynar-user.js';
import { TokenIndexerError } from '../../errors.js';

type GetExistingAccountInfoParams = {
  tokenCreatorAddress: Address;
  neynarUser?: NeynarUser;
};

type GetExistingAccountInfoResult = {
  existingWallets: Wallet[];
  existingXAccounts: XAccount[];
  existingFarcasterAccount?: FarcasterAccount;
  accountEntityId?: number;
};

/**
 * Retrieves existing account info from the DB
 */
export const getExistingAccountInfo = async (
  poolDb: ServerlessDb,
  { tokenCreatorAddress, neynarUser }: GetExistingAccountInfoParams
): Promise<GetExistingAccountInfoResult> => {
  const allWallets = getListOfWalletAddresses(tokenCreatorAddress, neynarUser);

  const existingWallets = await getWallets(poolDb, allWallets);
  const existingFarcasterAccount = neynarUser
    ? await getFarcasterAccount(poolDb, neynarUser.fid)
    : undefined;

  const xAccounts = getXAccountsFromNeynarUser(neynarUser);
  const existingXAccounts =
    xAccounts.length > 0 ? await getXAccounts(poolDb, xAccounts) : [];

  // Check if any of the accountEntityIds are different,
  // indicating either a bug or an oversight in the code
  const allAccountEntityIds = [
    ...existingWallets.map((wallet) => wallet.accountEntityId),
    ...existingXAccounts.map((xAccount) => xAccount.accountEntityId),
    ...(existingFarcasterAccount
      ? [existingFarcasterAccount.accountEntityId]
      : [])
  ];
  const uniqueAccountEntityIds = new Set(allAccountEntityIds);
  if (uniqueAccountEntityIds.size > 1) {
    throw new TokenIndexerError(
      'conflicting accountEntityIds detected',
      'getExistingAccountInfo',
      {
        wallets: existingWallets,
        xAccounts: existingXAccounts,
        farcasterAccount: existingFarcasterAccount
      }
    );
  }

  const accountEntityId =
    existingWallets[0]?.accountEntityId ??
    existingXAccounts[0]?.accountEntityId ??
    existingFarcasterAccount?.accountEntityId;
  return {
    existingWallets,
    existingFarcasterAccount,
    existingXAccounts,
    accountEntityId
  };
};
