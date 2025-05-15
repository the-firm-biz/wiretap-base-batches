import { integer, jsonb, pgTable, serial, smallint, text, timestamp } from 'drizzle-orm/pg-core';
import { gliderPortfolioRebalances } from './glider-portfolio-rebalances.js';
import { gliderPortfolioRebalancesLogLabels } from './glider-portfolio-rebalances-log-labels.js';

export const gliderPortfolioRebalancesLog = pgTable(
  'glider_portfolio_rebalances_log',
  {
    id: serial('id').primaryKey(),
    gliderPortfolioRebalancesId: integer('glider_portfolio_rebalances_id')
      .notNull()
      .references(() => gliderPortfolioRebalances.id),
    label: smallint('log_label')
      .references(() => gliderPortfolioRebalancesLogLabels.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    gliderRebalanceId: text('glider_rebalance_id'),
    response: jsonb()
  }
);

export type GliderPortfolioRebalancesLog =
  typeof gliderPortfolioRebalancesLog.$inferSelect;
export type NewGliderPortfolioRebalancesLog =
  typeof gliderPortfolioRebalancesLog.$inferInsert;
