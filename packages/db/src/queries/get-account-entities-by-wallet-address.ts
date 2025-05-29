import { eq } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import {
  accountEntities,
  wallets,
  type AccountEntity
} from '../schema/accounts/index.js';
import { lowerInArray } from '../utils/pg-helpers.js';

export async function getAccountEntitiesByWalletAddresses(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  walletAddresses: string[]
): Promise<AccountEntity[] | undefined> {
  const selectedAccountEntities = await db
    .select({ accountEntity: accountEntities })
    .from(accountEntities)
    .innerJoin(wallets, eq(accountEntities.id, wallets.accountEntityId))
    .where(lowerInArray(wallets.address, walletAddresses));

  if (!selectedAccountEntities || selectedAccountEntities.length === 0) {
    return undefined;
  }

  return selectedAccountEntities.map(({ accountEntity }) => accountEntity);
}
