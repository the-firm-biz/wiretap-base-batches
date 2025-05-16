import { eq, and } from 'drizzle-orm';
import {
  accountEntityTrackers,
  type NewAccountEntityTracker
} from '../schema/accounts/index.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function updateAccountEntityTracker(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  updatedAccountEntityTracker: NewAccountEntityTracker
) {
  const [updatedTracker] = await db
    .update(accountEntityTrackers)
    .set({
      maxSpend: updatedAccountEntityTracker.maxSpend,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(
          accountEntityTrackers.trackerWireTapAccountId,
          updatedAccountEntityTracker.trackerWireTapAccountId
        ),
        eq(
          accountEntityTrackers.trackedAccountEntityId,
          updatedAccountEntityTracker.trackedAccountEntityId
        )
      )
    )
    .returning();

  if (!updatedTracker) {
    throw new Error(
      'WiretapDbError:updateAccountEntityTracker - failed to update AccountEntityTracker (query returned 0 rows)'
    );
  }

  return updatedTracker;
}
