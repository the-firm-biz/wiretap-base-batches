import { tokens, type NewToken } from '../schema/tokens.js';
import { lowerEq } from '../utils/pg-helpers.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function getOrCreateToken(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newToken: NewToken
) {
  const [existingToken] = await db
    .select()
    .from(tokens)
    .where(lowerEq(tokens.address, newToken.address));

  if (existingToken) {
    return existingToken;
  }

  const [createdToken] = await db.insert(tokens).values(newToken).returning();

  if (!createdToken) {
    throw new Error(
      'WiretapDbError:getOrCreateToken - failed to create Token (query returned 0 rows)'
    );
  }

  return createdToken;
}
