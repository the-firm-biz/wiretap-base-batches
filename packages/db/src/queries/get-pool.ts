import { eq } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { currencies } from '../schema/currencies.js';
import { pools } from '../schema/pools.js';
import { lowerEq } from '../utils/pg-helpers.js';
import { tokens } from '../schema/tokens.js';

export async function getPool(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  poolAddress: `0x${string}`
) {
  const [existingPool] = await db
    .select()
    .from(pools)
    .innerJoin(currencies, eq(pools.currencyId, currencies.id))
    .innerJoin(tokens, eq(pools.tokenId, tokens.id))
    .where(lowerEq(pools.address, poolAddress));

  return existingPool;
}
