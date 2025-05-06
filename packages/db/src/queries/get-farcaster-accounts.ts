import { farcasterAccounts } from '../schema/accounts/index.js';
import { inArray } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function getFarcasterAccounts(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  fids: number[]
) {
  const existingFarcasterAccounts = await db
    .select()
    .from(farcasterAccounts)
    .where(inArray(farcasterAccounts.fid, fids));

  return existingFarcasterAccounts;
}
