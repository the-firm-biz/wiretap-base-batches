import type { NeynarUser } from '@wiretap/utils/server';
import type { Address } from 'viem';
import {
  getAccountEntityByFid,
  getAccountEntitiesByWalletAddresses,
  PooledDbConnection,
  getXAccounts,
  createAccountEntity
} from '@wiretap/db';
import { env } from '../../env.js';
import { getListOfWalletAddresses } from './get-list-of-wallet-addresses.js';
import { getXAccountsFromNeynarUser } from './get-x-accounts-from-neynar-user.js';
import { handleMultipleAssociatedAccountEntities } from './handle-multiple-associated-account-entities.js';

interface GetAccountEntityIdWithNeynarUserAndAddressParams {
  neynarUser: NeynarUser;
  tokenCreatorAddress: Address | null;
}

export async function getAccountEntityIdWithNeynarUserAndAddress({
  neynarUser,
  tokenCreatorAddress
}: GetAccountEntityIdWithNeynarUserAndAddressParams): Promise<number> {
  let accountEntityId: number | null = null;
  const dbPool = new PooledDbConnection({ databaseUrl: env.DATABASE_URL });

  try {
    // @todo jeff - promise.all the async calls, batch the db calls?
    return await dbPool.db.transaction(async (tx) => {
      /** Get account entities for addresses */
      const allWalletsAddresses = getListOfWalletAddresses(
        tokenCreatorAddress,
        neynarUser
      );
      const accountEntitiesForAddresses =
        await getAccountEntitiesByWalletAddresses(tx, allWalletsAddresses);

      const accountEntityIdsForAddresses = accountEntitiesForAddresses?.map(
        (accountEntity) => accountEntity.id
      );

      /** Get account entities for fid */
      const accountEntityForFid = await getAccountEntityByFid(
        tx,
        neynarUser.fid
      );
      const accountEntityIdForFid = accountEntityForFid?.id;

      /** Get account entities for verified x accounts */
      const xAccountsFromNeynarUser = getXAccountsFromNeynarUser(neynarUser);
      const existingXAccounts = xAccountsFromNeynarUser
        ? await getXAccounts(tx, xAccountsFromNeynarUser)
        : [];
      const accountEntityIdsForXAccounts = existingXAccounts.map(
        (xAccount) => xAccount.accountEntityId
      );

      const allAccountEntityIds = [
        ...(accountEntityIdsForAddresses ?? []),
        ...(accountEntityIdsForXAccounts ?? []),
        ...(accountEntityIdForFid ? [accountEntityIdForFid] : [])
      ];

      const uniqueAccountEntityIds = new Set(allAccountEntityIds);

      if (uniqueAccountEntityIds.size > 1) {
        accountEntityId = await handleMultipleAssociatedAccountEntities(
          tx,
          Array.from(uniqueAccountEntityIds)
        );

        // @todo temporary logging to help observability while these are cleared in our DB
        console.log(
          'multiple account entities merged!',
          'reassigned:: ',
          { accountEntityIdForFid },
          { accountEntityIdsForXAccounts },
          { accountEntityIdsForAddresses },
          'to:: ',
          accountEntityId
        );
      } else {
        accountEntityId = uniqueAccountEntityIds.values().next().value ?? null;
      }

      /** If no account entities found, create a new one */
      // @TODO JEFF DONT FORGET ABOUT THIS YOU SHIT - when handling merging account entities, this potentially needs moving into a separate function
      if (!accountEntityId) {
        const { accountEntity } = await createAccountEntity(tx, {
          newWallets: allWalletsAddresses.map((wallet) => ({
            address: wallet
          })),
          newXAccounts: xAccountsFromNeynarUser?.map((username) => ({
            xid: `xid-for-${username}`, // TODO: actually get xid
            username
          })),
          newFarcasterAccount: neynarUser
        });
        return accountEntity.id;
      }

      return accountEntityId;
    });
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbPool.endPoolConnection();
  }
}
