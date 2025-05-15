import { eq, sql } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { tokens } from '../schema/tokens.js';
import { lowerEq } from '../utils/pg-helpers.js';
import { accountEntities } from '../schema/index.js';

export async function getTokenIndex(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  tokenAddress: `0x${string}`
): Promise<number | null> {
  const creatorCte = db
    .$with('token_creator')
    .as(
      db
        .select({ accountEntityId: accountEntities.id })
        .from(tokens)
        .innerJoin(
          accountEntities,
          eq(tokens.accountEntityId, accountEntities.id)
        )
        .where(lowerEq(tokens.address, tokenAddress))
    );

  const tokenRankCte = db.$with('token_rank').as(
    db
      .with(creatorCte)
      .select({
        id: tokens.id,
        index: sql<number>`
          RANK() OVER (
            ORDER BY tokens.block, tokens.id
          )`.as('index')
      })
      .from(tokens)
      .innerJoin(
        creatorCte,
        eq(tokens.accountEntityId, creatorCte.accountEntityId)
      )
  );

  const [token] = await db
    .with(creatorCte, tokenRankCte)
    .select({
      index: sql<number>`token_rank.index::INTEGER`.as('index')
    })
    .from(tokenRankCte)
    .innerJoin(tokens, eq(tokenRankCte.id, tokens.id))
    .where(lowerEq(tokens.address, tokenAddress));

  return token?.index ?? null;
}
