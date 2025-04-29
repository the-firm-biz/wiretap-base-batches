import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { wallets } from '../schema/accounts/index.js';
import { lowerEq } from '../utils/pg-helpers.js';

export async function getWallet(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  walletAddress: `0x${string}`
) {
  const [existingWallet] = await db
    .select()
    .from(wallets)
    .where(lowerEq(wallets.address, walletAddress));

  return existingWallet;
}
