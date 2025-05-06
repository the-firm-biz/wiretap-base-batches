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

export async function createXAccounts(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newXAccounts: NewXAccount[]
): Promise<XAccount[]> {
  const createdXAccounts = await db
    .insert(xAccounts)
    .values(newXAccounts)
    .returning();

  return createdXAccounts;
}
