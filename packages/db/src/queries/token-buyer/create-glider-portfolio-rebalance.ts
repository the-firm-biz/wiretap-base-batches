import type {
  HttpDb,
  ServerlessDb,
  ServerlessDbTransaction
} from '../../client.js';
import {
  gliderPortfolioRebalances,
  type NewGliderPortfolioRebalance
} from '../../schema/glider-portfolio-rebalances.js';

export async function createGliderPortfolioRebalance(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newGliderPortfolioRebalance: NewGliderPortfolioRebalance
): Promise<number> {
  const [createdGliderPortfolioRebalance] = await db
    .insert(gliderPortfolioRebalances)
    .values(newGliderPortfolioRebalance)
    .returning();

  return createdGliderPortfolioRebalance!.id;
}
