import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { xAccounts } from '../schema/accounts/index.js';
import { lowerInArray } from '../utils/pg-helpers.js';

/**
 * Retrieves existing X accounts from the DB
 * TODO: once we have X API set up - use xid instead of usernames
 */
export async function getXAccounts(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  xUsernames: string[]
) {
  const existingXAccounts = await db
    .select()
    .from(xAccounts)
    .where(lowerInArray(xAccounts.username, xUsernames));

  return existingXAccounts;
}
