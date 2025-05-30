import type {
  HttpDb,
  ServerlessDb,
  ServerlessDbTransaction
} from '@wiretap/db';
import { inArray } from 'drizzle-orm';
import { accountEntities } from '@wiretap/db';

export async function deleteAccountEntities(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  accountEntityIds: number[]
): Promise<boolean> {
  if (accountEntityIds.length === 0) {
    return true;
  }

  await db
    .delete(accountEntities)
    .where(inArray(accountEntities.id, accountEntityIds));

  return true;
}
