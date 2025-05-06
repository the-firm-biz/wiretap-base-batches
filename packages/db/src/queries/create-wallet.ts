import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import {
  wallets,
  type NewWallet,
  type Wallet
} from '../schema/accounts/index.js';

export async function createWallet(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newWallet: NewWallet
): Promise<Wallet> {
  const [createdWallet] = await db
    .insert(wallets)
    .values(newWallet)
    .returning();

  if (!createdWallet) {
    throw new Error(
      'WiretapDbError:createWallet - failed to create Wallet (query returned 0 rows)'
    );
  }

  return createdWallet;
}
