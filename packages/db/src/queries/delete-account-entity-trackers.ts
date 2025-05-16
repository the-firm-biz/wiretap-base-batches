import { and } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { eq } from 'drizzle-orm';
import { accountEntityTrackers } from '../schema/accounts/index.js';

export async function deleteAccountEntityTrackers(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  {
    wireTapAccountId,
    accountEntityId
  }: {
    wireTapAccountId: number;
    accountEntityId: number;
  }
): Promise<boolean> {
  await db
    .delete(accountEntityTrackers)
    .where(
      and(
        eq(accountEntityTrackers.trackerWireTapAccountId, wireTapAccountId),
        eq(accountEntityTrackers.trackedAccountEntityId, accountEntityId)
      )
    );
  return true;
}
