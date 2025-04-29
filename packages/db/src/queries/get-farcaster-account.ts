import { farcasterAccounts } from '../schema/accounts/index.js';
import { eq } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function getFarcasterAccount(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  fid: number
) {
  const [existingFarcasterAccount] = await db
    .select()
    .from(farcasterAccounts)
    .where(eq(farcasterAccounts.fid, fid));

  return existingFarcasterAccount;
}
