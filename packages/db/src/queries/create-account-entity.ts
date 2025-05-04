import {
  accountEntities,
  type FarcasterAccount,
  type NewFarcasterAccount,
  type NewWallet,
  type NewXAccount,
  type AccountEntity,
  type Wallet,
  type XAccount,
  type NewWireTapAccount,
  type WireTapAccount
} from '../schema/accounts/index.js';
import { createWallet } from './create-wallet.js';
import { createFarcasterAccount } from './create-farcaster-account.js';
import { createXAccount } from './create-x-account.js';
import type { ServerlessDb } from '../client.js';
import { createWireTapAccount } from './create-wire-tap-account.js';

type createAccountEntityInput = {
  newWallet?: Omit<NewWallet, 'accountEntityId'>;
  newFarcasterAccount?: Omit<NewFarcasterAccount, 'accountEntityId'>;
  newXAccount?: Omit<NewXAccount, 'accountEntityId'>;
  newWireTapAccount?: Omit<NewWireTapAccount, 'accountEntityId'>;
  /** A name to give to the account entity (when creating new one) */
  label?: string;
};

export type createAccountEntityResponse = {
  accountEntity: AccountEntity;
  wallet?: Wallet;
  farcasterAccount?: FarcasterAccount;
  xAccount?: XAccount;
  wireTapAccount?: WireTapAccount;
};

/**
 * Creates an account entity row + associated rows in other tables (if provided at input).
 * Note: check for existing entity relationships before calling to avoid conflicts/mismatch across DB.
 */
export async function createAccountEntity(
  db: ServerlessDb,
  {
    newWallet,
    newFarcasterAccount,
    newXAccount,
    newWireTapAccount,
    label
  }: createAccountEntityInput
): Promise<createAccountEntityResponse> {
  const txResponse = await db.transaction(async (tx) => {
    const [createdAccountEntity] = await tx
      .insert(accountEntities)
      .values({ label })
      .returning();

    if (!createdAccountEntity) {
      throw new Error(
        'WiretapDbError:createAccountEntity - failed to create AccountEntity (query returned 0 rows)'
      );
    }

    const response: createAccountEntityResponse = {
      accountEntity: createdAccountEntity
    };

    // Create associated rows in other tables

    if (newWallet) {
      response.wallet = await createWallet(tx, {
        ...newWallet,
        accountEntityId: createdAccountEntity.id
      });
    }

    if (newFarcasterAccount) {
      response.farcasterAccount = await createFarcasterAccount(tx, {
        ...newFarcasterAccount,
        accountEntityId: createdAccountEntity.id
      });
    }

    if (newXAccount) {
      response.xAccount = await createXAccount(tx, {
        ...newXAccount,
        accountEntityId: createdAccountEntity.id
      });
    }

    if (newWireTapAccount) {
      response.wireTapAccount = await createWireTapAccount(tx, {
        ...newWireTapAccount,
        accountEntityId: createdAccountEntity.id
      });
    }

    return response;
  });

  return txResponse;
}
