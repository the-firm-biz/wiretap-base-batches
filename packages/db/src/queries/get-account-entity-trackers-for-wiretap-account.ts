import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { eq } from 'drizzle-orm';
import {
  accountEntityTrackers,
  type AccountEntityTracker
} from '../schema/accounts/index.js';

export async function getAccountEntityTrackersForWireTapAccount(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  wireTapAccountId: number
): Promise<AccountEntityTracker[]> {
  const existingAccountEntityTrackers = await db
    .select()
    .from(accountEntityTrackers)
    .where(eq(accountEntityTrackers.trackerWireTapAccountId, wireTapAccountId));

  if (!existingAccountEntityTrackers) {
    return [];
  }

  return existingAccountEntityTrackers;
}
