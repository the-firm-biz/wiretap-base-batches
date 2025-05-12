import { lowerEq } from '../utils/pg-helpers.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { pools, type NewPool } from '../schema/pools.js';

export async function getOrCreatePool(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newPool: NewPool
) {
  const [existingPool] = await db
    .select()
    .from(pools)
    .where(lowerEq(pools.address, newPool.address));

  if (existingPool) {
    return existingPool;
  }

  const [createdPool] = await db.insert(pools).values(newPool).returning();

  if (!createdPool) {
    throw new Error(
      'WiretapDbError:getOrCreatePool - failed to create Pool (query returned 0 rows)'
    );
  }

  return createdPool;
}
