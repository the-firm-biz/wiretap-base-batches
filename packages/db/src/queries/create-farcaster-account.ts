import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import {
  farcasterAccounts,
  type NewFarcasterAccount
} from '../schema/accounts/index.js';

export async function createFarcasterAccount(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newFarcasterAccount: NewFarcasterAccount
) {
  const [createdFarcasterAccount] = await db
    .insert(farcasterAccounts)
    .values(newFarcasterAccount)
    .returning();

  if (!createdFarcasterAccount) {
    throw new Error(
      'WiretapDbError:createFarcasterAccount - failed to create FarcasterAccount (query returned 0 rows)'
    );
  }

  return createdFarcasterAccount;
}
