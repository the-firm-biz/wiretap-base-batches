import { tokens, type NewToken, type Token } from '../schema/tokens.js';
import { lowerEq } from '../utils/pg-helpers.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function getToken(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newToken: NewToken
): Promise<Token | null> {
  const [existingToken] = await db
    .select()
    .from(tokens)
    .where(lowerEq(tokens.address, newToken.address));

  if (!existingToken) {
    return null;
  }

  return existingToken;
}
