import { wireTapAccounts } from '../schema/accounts/index.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { eq } from 'drizzle-orm';

export async function getWireTapAccount(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  accountEntityId: number
) {
  const [existingWireTapAccount] = await db
    .select()
    .from(wireTapAccounts)
    .where(eq(wireTapAccounts.accountEntityId, accountEntityId));

  return existingWireTapAccount;
}
