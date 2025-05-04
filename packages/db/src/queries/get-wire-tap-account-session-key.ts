import { and, eq } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { wireTapSessionKeys } from '../schema/accounts/index.js';

export async function getWireTapAccountSessionKey(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  wireTapAccountId: number
) {
  const [existingWireTapAccountSessionKey] = await db
    .select()
    .from(wireTapSessionKeys)
    .where(
      and(
        eq(wireTapSessionKeys.wireTapAccountId, wireTapAccountId),
        eq(wireTapSessionKeys.isActive, true)
      )
    );

  return existingWireTapAccountSessionKey;
}
