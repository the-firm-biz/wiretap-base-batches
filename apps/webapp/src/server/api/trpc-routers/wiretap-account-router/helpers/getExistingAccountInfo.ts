import { z } from 'zod';
import {
  FarcasterAccount,
  getFarcasterAccount,
  getWallets,
  getXAccounts,
  type HttpDb,
  type ServerlessDb,
  type ServerlessDbTransaction,
  type Wallet,
  type XAccount
} from '@wiretap/db';
import { neynarUserSchema } from '@wiretap/utils/server';
import { Address, isAddressEqual } from 'viem';

// TODO: DRY this up with @wiretap/token-created-watcher's commit-account-info-to-db.ts

export const getExistingAccountInfo = async (
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  evmAddress?: Address,
  neynarUser?: z.infer<typeof neynarUserSchema> | null
): Promise<{
  existingWallets: Wallet[];
  existingXAccounts: XAccount[];
  existingFarcasterAccount?: FarcasterAccount;
  accountEntityId?: number;
}> => {
  const neynarEthWallets = neynarUser?.verified_addresses.eth_addresses ?? [];
  const allWallets = neynarEthWallets.reduce(
    (acc, cur) => {
      if (!acc.some((w) => isAddressEqual(w, cur as Address))) {
        acc.push(cur as Address);
      }
      return acc;
    },
    evmAddress ? [evmAddress as Address] : []
  );

  console.log('ALL WALLETS', allWallets);
  const existingWallets = await getWallets(db, allWallets);

  const existingFarcasterAccount = neynarUser
    ? await getFarcasterAccount(db, neynarUser.fid)
    : undefined;

  const neynarXAccounts = neynarUser
    ? neynarUser.verified_accounts
        .filter(({ platform }) => platform === 'x')
        .map(({ username }) => username)
        .filter((username) => username !== undefined && username !== null) // to satisfy typescript
    : [];

  const existingXAccounts =
    neynarXAccounts.length > 0 ? await getXAccounts(db, neynarXAccounts) : [];

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
    console.error('conflicting accountEntityIds detected', {
      wallets: existingWallets,
      xAccounts: existingXAccounts,
      farcasterAccount: existingFarcasterAccount
    });
    throw new Error('conflicting accountEntityIds detected');
  }

  const accountEntityId =
    existingWallets[0]?.accountEntityId ??
    existingXAccounts[0]?.accountEntityId ??
    existingFarcasterAccount?.accountEntityId;

  return {
    accountEntityId,
    existingWallets,
    existingXAccounts,
    existingFarcasterAccount
  };
};
