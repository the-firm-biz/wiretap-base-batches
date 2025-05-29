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
import { createWallets } from './create-wallets.js';
import { createFarcasterAccount } from './create-farcaster-account.js';
import type { ServerlessDb } from '../client.js';
import { createXAccounts } from './create-x-accounts.js';
import { createWireTapAccount } from './create-wire-tap-account.js';

type createAccountEntityInput = {
  newWallets?: Omit<NewWallet, 'accountEntityId'>[];
  newFarcasterAccount?: Omit<NewFarcasterAccount, 'accountEntityId'>;
  newXAccounts?: Omit<NewXAccount, 'accountEntityId'>[];
  newWireTapAccount?: Omit<NewWireTapAccount, 'accountEntityId'>;
  /** A name to give to the account entity (when creating new one) */
  label?: string;
};

export type CreateAccountEntityResponse = {
  accountEntity: AccountEntity;
  wallets: Wallet[];
  farcasterAccount?: FarcasterAccount;
  xAccounts: XAccount[];
  wireTapAccount?: WireTapAccount;
};

/**
 * Creates an account entity row + associated rows in other tables (if provided at input).
 * Note: check for existing entity relationships before calling to avoid conflicts/mismatch across DB.
 */
export async function createAccountEntity(
  db: ServerlessDb,
  {
    newWallets,
    newFarcasterAccount,
    newXAccounts,
    newWireTapAccount,
    label
  }: createAccountEntityInput
): Promise<CreateAccountEntityResponse> {
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

    const response: CreateAccountEntityResponse = {
      accountEntity: createdAccountEntity,
      wallets: [],
      xAccounts: []
    };

    // Create associated rows in other tables

    if (newWallets && newWallets.length > 0) {
      const walletsWithAccountEntityId = newWallets.map((wallet) => ({
        ...wallet,
        accountEntityId: createdAccountEntity.id
      }));
      response.wallets = await createWallets(tx, walletsWithAccountEntityId);
    }

    if (newFarcasterAccount) {
      response.farcasterAccount = await createFarcasterAccount(tx, {
        ...newFarcasterAccount,
        accountEntityId: createdAccountEntity.id
      });
    }

    if (newXAccounts && newXAccounts.length > 0) {
      const xAccountsWithAccountEntityId = newXAccounts.map((xAccount) => ({
        ...xAccount,
        accountEntityId: createdAccountEntity.id
      }));
      response.xAccounts = await createXAccounts(
        tx,
        xAccountsWithAccountEntityId
      );
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
