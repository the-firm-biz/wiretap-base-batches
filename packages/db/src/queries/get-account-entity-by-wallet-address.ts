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

export async function getAccountEntityByWalletAddress(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  walletAddress: string
): Promise<AccountEntity | undefined> {
  const [accountEntity] = await db
    .select()
    .from(accountEntities)
    .innerJoin(wallets, eq(accountEntities.id, wallets.accountEntityId))
    .where(eq(wallets.address, walletAddress));

  return accountEntity?.account_entities;
}
