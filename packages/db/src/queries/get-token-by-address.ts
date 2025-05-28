import { tokens, type Token } from '../schema/tokens.js';
import { lowerEq } from '../utils/pg-helpers.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function getTokenByAddress(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  tokenAddress: string
): Promise<Token | null> {
  const [existingToken] = await db
    .select()
    .from(tokens)
    .where(lowerEq(tokens.address, tokenAddress));

  if (!existingToken) {
    return null;
  }

  return existingToken;
}
