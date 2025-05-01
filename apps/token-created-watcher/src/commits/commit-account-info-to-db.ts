import {
  createFarcasterAccount,
  createAccountEntity,
  type FarcasterAccount,
  getFarcasterAccount,
  getWallets,
  type Wallet,
  type ServerlessDb,
  createWallets,
  getXAccounts,
  type XAccount,
  createXAccounts
} from '@wiretap/db';
import type { Address } from 'viem';
import type { NeynarUser } from '@wiretap/utils/server';
import { TokenIndexerError } from '../errors.js';

/** Returns the list of all wallets to be checked or created */
const getListOfWallets = (
  tokenCreatorAddress: Address,
  neynarUser?: NeynarUser
) => {
  const allWallets = [tokenCreatorAddress];

  if (!neynarUser) {
    return allWallets;
  }

  const neynarEthWallets = neynarUser.verified_addresses.eth_addresses;
  return neynarEthWallets.reduce((acc, cur) => {
    if (!acc.some((w) => w.toLowerCase() === cur.toLowerCase())) {
      acc.push(cur as Address);
    }
    return acc;
  }, allWallets);
};

const getXAccountsFromNeynarUser = (neynarUser?: NeynarUser) => {
  if (!neynarUser) {
    return [];
  }
  return neynarUser?.verified_accounts
    .filter(({ platform }) => platform === 'x')
    .map(({ username }) => username)
    .filter((username) => username !== undefined); // probably some type mistake in Neynar
};

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
const getExistingAccountInfo = async (
  poolDb: ServerlessDb,
  { tokenCreatorAddress, neynarUser }: GetExistingAccountInfoParams
): Promise<GetExistingAccountInfoResult> => {
  const allWallets = getListOfWallets(tokenCreatorAddress, neynarUser);
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
const updateExistingAccountInfo = async (
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
      accountEntityId
    });
    result.farcasterAccounts.push(createdFarcasterAccount);
  }

  // Create wallets if they don't exist
  const allWallets = getListOfWallets(tokenCreatorAddress, neynarUser);
  const newWallets = allWallets.filter(
    (wallet) => !existingWallets.some((w) => w.address === wallet)
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
    (xAccount) => !existingXAccounts.some((x) => x.username === xAccount)
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
  const {
    existingWallets,
    existingXAccounts,
    existingFarcasterAccount,
    accountEntityId
  } = await getExistingAccountInfo(poolDb, { tokenCreatorAddress, neynarUser });

  if (!accountEntityId) {
    const allWallets = getListOfWallets(tokenCreatorAddress, neynarUser);
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
          ? { fid: neynarUser.fid, username: neynarUser.username }
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
