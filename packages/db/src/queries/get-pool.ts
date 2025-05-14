import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { pools } from '../schema/pools.js';
import { lowerEq } from '../utils/pg-helpers.js';

export async function getPool(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  poolAddress: `0x${string}`
) {
  const [existingPool] = await db
    .select()
    .from(pools)
    .where(lowerEq(pools.address, poolAddress));

  return existingPool;
}
