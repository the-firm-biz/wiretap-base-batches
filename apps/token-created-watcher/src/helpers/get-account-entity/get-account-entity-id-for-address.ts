import type { Address } from 'viem';
import {
  getAccountEntitiesByWalletAddresses,
  PooledDbConnection,
  createAccountEntity
} from '@wiretap/db';
import { env } from '../../env.js';
import { TokenIndexerError } from '../../errors.js';

interface GetAccountEntityIdForAddressParams {
  tokenCreatorAddress: Address;
}

export async function getAccountEntityIdForAddress({
  tokenCreatorAddress
}: GetAccountEntityIdForAddressParams): Promise<number> {
  const dbPool = new PooledDbConnection({ databaseUrl: env.DATABASE_URL });

  try {
    // @todo jeff - promise.all the async calls, batch the db calls?
    return await dbPool.db.transaction(async (tx) => {
      /** Get account entities for addresses */
      const accountEntitiesForAddresses =
        await getAccountEntitiesByWalletAddresses(tx, [tokenCreatorAddress]);

      const accountEntityIdsForAddresses = accountEntitiesForAddresses?.map(
        (accountEntity) => accountEntity.id
      );

      if (
        accountEntityIdsForAddresses &&
        accountEntityIdsForAddresses.length > 1
      ) {
        throw new TokenIndexerError(
          'multiple accountEntityIds detected',
          'getAccountEntityIdForAddress',
          {
            walletAddresses: [tokenCreatorAddress]
          }
        );
      }

      const accountEntityId = accountEntityIdsForAddresses?.[0];

      /** If no account entitiy found, create a new one */
      // @todo jeff - when handling merging account entities, this potentially needs moving into a separate function
      if (!accountEntityId) {
        const { accountEntity } = await createAccountEntity(tx, {
          newWallets: [{ address: tokenCreatorAddress }]
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
