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

export async function createWallets(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newWallets: NewWallet[]
): Promise<Wallet[]> {
  const createdWallets = await db
    .insert(wallets)
    .values(newWallets)
    .returning();

  return createdWallets;
}
