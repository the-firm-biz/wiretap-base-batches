import type {
  HttpDb,
  ServerlessDb,
  ServerlessDbTransaction
} from '../../client.js';
import {
  gliderPortfolioRebalancesLog,
  type NewGliderPortfolioRebalancesLog
} from '../../schema/glider-portfolio-rebalances-log.js';

export async function insertGliderPortfolioRebalanceLog(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  NewGliderPortfolioRebalancesLog: NewGliderPortfolioRebalancesLog
): Promise<void> {
  await db
    .insert(gliderPortfolioRebalancesLog)
    .values(NewGliderPortfolioRebalancesLog)
    .returning();
}