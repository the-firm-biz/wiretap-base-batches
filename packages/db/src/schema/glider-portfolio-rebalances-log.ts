import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { gliderPortfolioRebalances } from './glider-portfolio-rebalances.js';

export const gliderPortfolioRebalancesLog = pgTable(
  'glider_portfolio_rebalances_log',
  {
    id: serial('id').primaryKey(),
    gliderPortfolioRebalancesId: integer('glider_portfolio_rebalances_id')
      .notNull()
      .references(() => gliderPortfolioRebalances.id),
    label: text().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    gliderRebalanceId: text('glider_rebalance_id'),
    response: text()
  }
);

export type GliderPortfolioRebalancesLog =
  typeof gliderPortfolioRebalancesLog.$inferSelect;
export type NewGliderPortfolioRebalancesLog =
  typeof gliderPortfolioRebalancesLog.$inferInsert;
