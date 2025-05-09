import {
  accountEntityTrackers,
  type NewAccountEntityTracker
} from '../schema/accounts/index.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function createAccountEntityTracker(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newAccountEntityTracker: NewAccountEntityTracker
) {
  const [createdAccountEntityTracker] = await db
    .insert(accountEntityTrackers)
    .values(newAccountEntityTracker)
    .returning();

  if (!createdAccountEntityTracker) {
    throw new Error(
      'WiretapDbError:createAccountEntityTracker - failed to create AccountEntityTracker (query returned 0 rows)'
    );
  }

  return createdAccountEntityTracker;
}
