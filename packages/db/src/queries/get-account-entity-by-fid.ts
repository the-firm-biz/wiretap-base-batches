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
  const selectedAccountEntity = await db
    .select({
      accountEntity: accountEntities
    })
    .from(farcasterAccounts)
    .leftJoin(
      accountEntities,
      eq(farcasterAccounts.accountEntityId, accountEntities.id)
    )
    .where(eq(farcasterAccounts.fid, fid));

  const accountEntityForFid = selectedAccountEntity[0];

  if (!accountEntityForFid?.accountEntity) {
    return undefined;
  }

  return accountEntityForFid.accountEntity;
}
