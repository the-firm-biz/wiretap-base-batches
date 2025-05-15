import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { gliderPortfolioRebalances } from './glider-portfolio-rebalances.js';

export const gliderPortfolioRebalancesLog = pgTable(
  'glider_portfolio_rebalances_log',
  {
    id: serial('id').primaryKey(),
    gliderPortfolioRebalancesId: integer('glider_portfolio_rebalances_id')
      .notNull()
      .references(() => gliderPortfolioRebalances.id),
    action: text().notNull(),
    response: text()
  }
);

export type GliderPortfolioRebalancesLog =
  typeof gliderPortfolioRebalancesLog.$inferSelect;
export type NewGliderPortfolioRebalancesLog =
  typeof gliderPortfolioRebalancesLog.$inferInsert;
