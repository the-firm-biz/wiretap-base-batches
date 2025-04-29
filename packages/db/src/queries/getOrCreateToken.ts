import { eq } from 'drizzle-orm';
import { tokens, type NewToken } from '../schema/tokens.js';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { lower } from '../utils/pg-helpers.js';

export async function getOrCreateToken(
  db: NeonHttpDatabase,
  newToken: NewToken
) {
  const [existingToken] = await db
    .select()
    .from(tokens)
    .where(eq(lower(tokens.address), newToken.address.toLowerCase()));
  if (existingToken) {
    return existingToken;
  }
  const [insertedRow] = await db.insert(tokens).values(newToken).returning();

  if (!insertedRow) {
    throw new Error('getOrCreateToken returned an empty array');
  }
  return insertedRow;
}
