import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { pools, type Pool } from '../schema/pools.js';
import { and, eq, gt } from 'drizzle-orm';

export async function updatePoolAthMcap(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  poolAddress: string,
  athMcapUsd: number
): Promise<Pool | undefined> {
  const [updatedPool] = await db
    .update(pools)
    .set({ athMcapUsd })
    .where(
      and(eq(pools.address, poolAddress), gt(pools.athMcapUsd, athMcapUsd))
    )
    .returning();

  return updatedPool;
}
