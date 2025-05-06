import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { wallets } from '../schema/accounts/index.js';
import { lowerInArray } from '../utils/pg-helpers.js';

export async function getWallets(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  walletAddresses: `0x${string}`[]
) {
  const existingWallets = await db
    .select()
    .from(wallets)
    .where(lowerInArray(wallets.address, walletAddresses));

  return existingWallets;
}
