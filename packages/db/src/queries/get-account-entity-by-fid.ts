import { eq } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import {
  accountEntities,
  farcasterAccounts,
  type AccountEntity
} from '../schema/accounts/index.js';

export async function getAccountEntityByFid(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  fid: number
): Promise<AccountEntity | undefined> {
  const [accountEntity] = await db
    .select()
    .from(accountEntities)
    .innerJoin(
      farcasterAccounts,
      eq(accountEntities.id, farcasterAccounts.accountEntityId)
    )
    .where(eq(farcasterAccounts.fid, fid));

  return accountEntity?.account_entities;
}
