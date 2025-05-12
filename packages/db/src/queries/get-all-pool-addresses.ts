import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { pools } from '../schema/pools.js';

export async function getAllPoolAddresses(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb
): Promise<`0x${string}`[]> {
  const poolAddresses = await db.select({ address: pools.address }).from(pools);

  return poolAddresses.map((pool) => pool.address as `0x${string}`);
}
