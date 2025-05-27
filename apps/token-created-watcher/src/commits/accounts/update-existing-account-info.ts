import { createXAccounts } from '@wiretap/db';
import { createWallets } from '@wiretap/db';
import type { Wallet } from '@wiretap/db';
import type { XAccount } from '@wiretap/db';
import type { FarcasterAccount } from '@wiretap/db';
import { createFarcasterAccount } from '@wiretap/db';
import type { ServerlessDb } from '@wiretap/db';
import type { NeynarUser } from '@wiretap/utils/server';
import type { Address } from 'viem';
import { getListOfWalletAddresses } from './get-list-of-wallet-addresses.js';
import { isAddressEqual } from '@wiretap/utils/shared';
import { getXAccountsFromNeynarUser } from './get-x-accounts-from-neynar-user.js';

type UpdateExistingAccountInfoParams = {
  tokenCreatorAddress: Address;
  existingFarcasterAccount?: FarcasterAccount;
  existingWallets: Wallet[];
  existingXAccounts: XAccount[];
  neynarUser?: NeynarUser;
  accountEntityId: number;
};

type UpdateExistingAccountInfoResult = {
  wallets: Wallet[];
  xAccounts: XAccount[];
  farcasterAccounts: FarcasterAccount[];
};

/**
 * Adds new rows related to accountEntityId
 */
export const updateExistingAccountInfo = async (
  poolDb: ServerlessDb,
  {
    tokenCreatorAddress,
    existingFarcasterAccount,
    existingWallets,
    existingXAccounts,
    neynarUser,
    accountEntityId
  }: UpdateExistingAccountInfoParams
): Promise<UpdateExistingAccountInfoResult> => {
  const result: UpdateExistingAccountInfoResult = {
    wallets: existingWallets,
    farcasterAccounts: existingFarcasterAccount
      ? [existingFarcasterAccount]
      : [],
    xAccounts: existingXAccounts
  };

  const isBrandNewFarcasterAccount = neynarUser && !existingFarcasterAccount;
  if (isBrandNewFarcasterAccount) {
    const createdFarcasterAccount = await createFarcasterAccount(poolDb, {
      fid: neynarUser.fid,
      username: neynarUser.username,
      accountEntityId,
      displayName: neynarUser.display_name,
      pfpUrl: neynarUser.pfp_url,
      followerCount: neynarUser.follower_count
    });
    result.farcasterAccounts.push(createdFarcasterAccount);
  }

  // Create wallets if they don't exist
  const allWallets = getListOfWalletAddresses(tokenCreatorAddress, neynarUser);
  const newWallets = allWallets.filter(
    (wallet) => !existingWallets.some((w) => isAddressEqual(w.address, wallet))
  );
  if (newWallets.length > 0) {
    const createdWallets = await createWallets(
      poolDb,
      newWallets.map((wallet) => ({
        address: wallet,
        accountEntityId
      }))
    );
    result.wallets.push(...createdWallets);
  }

  // Create X accounts if they don't exist
  const neynarXAccounts = getXAccountsFromNeynarUser(neynarUser);
  const newXAccounts = neynarXAccounts.filter(
    (xAccount) =>
      !existingXAccounts.some(
        (x) => x.username.toLowerCase() === xAccount.toLowerCase()
      )
  );
  if (newXAccounts.length > 0) {
    const createdXAccounts = await createXAccounts(
      poolDb,
      newXAccounts.map((username) => ({
        xid: `xid-for-${username}`, // TODO: actually get xid
        username,
        accountEntityId
      }))
    );
    result.xAccounts.push(...createdXAccounts);
  }

  return result;
};
