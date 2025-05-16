import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { pools, type Pool } from '../schema/pools.js';
import { and, lt, sql } from 'drizzle-orm';
import { lowerEq } from '../utils/pg-helpers.js';

export async function updatePoolAthMcap(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  poolAddress: string,
  athMcapUsd: number
): Promise<Pool | undefined> {
  const [updatedPool] = await db
    .update(pools)
    .set({ athMcapUsd, updatedAt: sql`NOW()` })
    .where(
      and(lowerEq(pools.address, poolAddress), lt(pools.athMcapUsd, athMcapUsd))
    )
    .returning();

  return updatedPool;
}
