import {
  farcasterAccounts,
  type FarcasterAccount
} from '../schema/accounts/index.js';
import { eq } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function getFarcasterAccountsByAccountEntityId(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  accountEntityId: number
): Promise<FarcasterAccount[]> {
  const existingFarcasterAccounts = await db
    .select()
    .from(farcasterAccounts)
    .where(eq(farcasterAccounts.accountEntityId, accountEntityId));

  return existingFarcasterAccounts;
}
