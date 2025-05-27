import {
  createAccountEntity,
  type FarcasterAccount,
  type Wallet,
  type ServerlessDb,
  type XAccount
} from '@wiretap/db';
import type { Address } from 'viem';
import type { NeynarUser } from '@wiretap/utils/server';
import { getXAccountsFromNeynarUser } from './get-x-accounts-from-neynar-user.js';
import { getListOfWalletAddresses } from './get-list-of-wallet-addresses.js';
import { getExistingAccountInfo } from './get-existing-account-info.js';
import { updateExistingAccountInfo } from './update-existing-account-info.js';

type CommitAccountInfoToDbParams = {
  tokenCreatorAddress: Address;
  neynarUser?: NeynarUser;
};

type CommitAccountInfoToDbResult = {
  accountEntityId: number;
  wallets: Wallet[];
  farcasterAccounts: FarcasterAccount[];
  xAccounts: XAccount[];
};

/**
 * Creates account-related rows in DB or adds new info to existing accounts
 */
export const commitAccountInfoToDb = async (
  poolDb: ServerlessDb,
  { tokenCreatorAddress, neynarUser }: CommitAccountInfoToDbParams
): Promise<CommitAccountInfoToDbResult> => {
  if (!accountEntityId) {
    const allWallets = getListOfWalletAddresses(
      tokenCreatorAddress,
      neynarUser
    );
    const newXAccounts = getXAccountsFromNeynarUser(neynarUser);

    const { accountEntity, wallets, farcasterAccount, xAccounts } =
      await createAccountEntity(poolDb, {
        newWallets: allWallets.map((wallet) => ({
          address: wallet
        })),
        newXAccounts: newXAccounts.map((username) => ({
          xid: `xid-for-${username}`, // TODO: actually get xid
          username
        })),
        newFarcasterAccount: neynarUser
          ? {
              fid: neynarUser.fid,
              username: neynarUser.username,
              displayName: neynarUser.display_name,
              pfpUrl: neynarUser.pfp_url,
              followerCount: neynarUser.follower_count
            }
          : undefined
      });
    return {
      accountEntityId: accountEntity.id,
      wallets,
      farcasterAccounts: farcasterAccount ? [farcasterAccount] : [],
      xAccounts
    };
  }

  const { wallets, xAccounts, farcasterAccounts } =
    await updateExistingAccountInfo(poolDb, {
      tokenCreatorAddress,
      existingFarcasterAccount,
      existingWallets,
      existingXAccounts,
      neynarUser,
      accountEntityId
    });
  return {
    accountEntityId,
    wallets,
    farcasterAccounts,
    xAccounts
  };
};
