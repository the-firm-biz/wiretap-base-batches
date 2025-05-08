import { gliderPortfolios } from '../schema/glider-portfolio.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { eq } from 'drizzle-orm';

export async function getGliderPortfolioForWireTapAccount(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  wireTapAccountId: number
) {
  const [existingGliderPortfolio] = await db
    .select()
    .from(gliderPortfolios)
    .where(eq(gliderPortfolios.wireTapAccountId, wireTapAccountId));

  return existingGliderPortfolio;
}
