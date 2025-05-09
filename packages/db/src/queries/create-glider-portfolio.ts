import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import {
  gliderPortfolios,
  type NewGliderPortfolio
} from '../schema/glider-portfolio.js';

export async function createGliderPortfolio(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newGliderPortfolio: NewGliderPortfolio
) {
  const [createdGliderPortfolio] = await db
    .insert(gliderPortfolios)
    .values(newGliderPortfolio)
    .returning();

  if (!createdGliderPortfolio) {
    throw new Error(
      'WiretapDbError:createGliderPortfolio - failed to create GliderPortfolio (query returned 0 rows)'
    );
  }

  return createdGliderPortfolio;
}
