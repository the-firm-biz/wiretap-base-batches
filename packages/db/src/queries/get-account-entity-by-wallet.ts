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

export async function getAccountEntityByWallet(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  walletAddress: string
): Promise<AccountEntity | undefined> {
  const selectedAccountEntity = await db
    .select({
      accountEntity: accountEntities
    })
    .from(accountEntities)
    .leftJoin(wallets, eq(wallets.accountEntityId, accountEntities.id))
    .where(eq(wallets.address, walletAddress));

  const accountEntityForWallet = selectedAccountEntity[0];

  if (!accountEntityForWallet) {
    return undefined;
  }

  return accountEntityForWallet.accountEntity;
}
