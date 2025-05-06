import {
  accountEntities,
  type FarcasterAccount,
  type NewFarcasterAccount,
  type NewWallet,
  type NewXAccount,
  type AccountEntity,
  type Wallet,
  type XAccount
} from '../schema/accounts/index.js';
import { createWallets } from './create-wallets.js';
import { createFarcasterAccount } from './create-farcaster-account.js';
import type { ServerlessDb } from '../client.js';
import { createXAccounts } from './create-x-accounts.js';

type createAccountEntityInput = {
  newWallets?: Omit<NewWallet, 'accountEntityId'>[];
  newFarcasterAccount?: Omit<NewFarcasterAccount, 'accountEntityId'>;
  newXAccounts?: Omit<NewXAccount, 'accountEntityId'>[];
  /** A name to give to the account entity (when creating new one) */
  label?: string;
};

export type createAccountEntityResponse = {
  accountEntity: AccountEntity;
  wallets: Wallet[];
  farcasterAccount?: FarcasterAccount;
  xAccounts: XAccount[];
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
    return response;
  });

  return txResponse;
}
