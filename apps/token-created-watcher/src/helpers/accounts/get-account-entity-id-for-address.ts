import type { Address } from 'viem';
import {
  getAccountEntitiesByWalletAddresses,
  type CreateAccountEntityInput,
  type ServerlessDb
} from '@wiretap/db';

interface GetAccountEntityIdForAddressParams {
  tokenCreatorAddress: Address;
}

/**
 * Returns an account entity ID for a given address if it's found,
 * otherwise returns a CreateAccountEntityInput object to create a new account entity.
 */
export async function getAccountEntityIdForAddress(
  tx: ServerlessDb,
  { tokenCreatorAddress }: GetAccountEntityIdForAddressParams
): Promise<number | CreateAccountEntityInput> {
  try {
    /** Get account entities for address */
    const accountEntitiesForAddresses =
      await getAccountEntitiesByWalletAddresses(tx, [tokenCreatorAddress]);

    const accountEntityIdsForAddresses = accountEntitiesForAddresses?.map(
      (accountEntity) => accountEntity.id
    );

    const accountEntityId = accountEntityIdsForAddresses?.[0];
    return (
      accountEntityId ?? {
        newWallets: [{ address: tokenCreatorAddress }]
      }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}
