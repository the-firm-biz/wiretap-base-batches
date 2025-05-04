import { tokens } from '../schema/tokens.js';
import { eq, sql } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

/**
 * Counts the number of tokens deployed by a specific token creator entity
 */
export async function countTokensByCreator(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  accountEntityId: number
): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(tokens)
    .where(eq(tokens.accountEntityId, accountEntityId));

  if (!result) {
    return 0;
  }

  return result.count;
}
