import { tokens } from '../schema/tokens.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

export async function getAllTokens(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb
) {
  const allTokens = await db.select().from(tokens);

  return allTokens;
}
