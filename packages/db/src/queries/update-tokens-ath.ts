import { tokens } from '../schema/tokens.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { inArray, sql, type SQL } from 'drizzle-orm';

export async function updateTokensAthPriceUsd(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  tokensToUpdate: {
    id: number;
    athPriceUsd: string;
  }[]
) {
  if (tokensToUpdate.length === 0) {
    return [];
  }

  const sqlChunks: SQL[] = [];
  const ids: number[] = [];
  sqlChunks.push(sql`(case`);
  for (const token of tokensToUpdate) {
    sqlChunks.push(
      sql`when ${tokens.id} = ${token.id} then ${sql`${token.athPriceUsd}::numeric`}`
    );
    ids.push(token.id);
  }
  sqlChunks.push(sql`end)`);

  const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));

  const updatedTokens = await db
    .update(tokens)
    .set({ athPriceUsd: finalSql })
    .where(inArray(tokens.id, ids))
    .returning();

  return updatedTokens;
}
