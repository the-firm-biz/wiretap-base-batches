import {
  xAccounts,
  type NewXAccount,
  type XAccount
} from '../schema/accounts/index.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function createXAccount(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newXAccount: NewXAccount
): Promise<XAccount> {
  const [createdXAccount] = await db
    .insert(xAccounts)
    .values(newXAccount)
    .returning();

  if (!createdXAccount) {
    throw new Error(
      'WiretapDbError:createXAccount - failed to create XAccount (query returned 0 rows)'
    );
  }

  return createdXAccount;
}
