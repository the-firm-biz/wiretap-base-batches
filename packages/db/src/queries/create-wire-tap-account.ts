import {
  wireTapAccounts,
  type NewWireTapAccount
} from '../schema/accounts/index.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { eq } from 'drizzle-orm';

export async function createWireTapAccount(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newWireTapAccount: NewWireTapAccount
) {
  // @todo - update inserts to avoid id bumps on conflict
  const [createdWireTapAccount] = await db
    .insert(wireTapAccounts)
    .values(newWireTapAccount)
    .onConflictDoNothing()
    .returning();

  if (createdWireTapAccount) {
    return createdWireTapAccount;
  }

  const [wireTapAccount] = await db
    .select()
    .from(wireTapAccounts)
    .where(
      eq(wireTapAccounts.accountEntityId, newWireTapAccount.accountEntityId)
    );

  if (!wireTapAccount) {
    throw new Error(
      'WiretapDbError:createWireTapAccount - failed to create WireTapAccount (query returned 0 rows)'
    );
  }

  return wireTapAccount;
}
