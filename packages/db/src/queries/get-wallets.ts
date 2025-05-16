import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { wallets, type Wallet } from '../schema/accounts/index.js';
import { lowerInArray } from '../utils/pg-helpers.js';

export async function getWallets(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  walletAddresses: `0x${string}`[]
): Promise<Wallet[]> {
  if (walletAddresses.length === 0) {
    return [];
  }

  const existingWallets = await db
    .select()
    .from(wallets)
    .where(lowerInArray(wallets.address, walletAddresses));

  return existingWallets;
}
