import { bigint, integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import { tokens } from './tokens.js';
import { gliderPortfolios } from './glider-portfolio.js';

export const gliderPortfolioRebalances = pgTable(
  'glider_portfolio_rebalances',
  {
    id: serial('id').primaryKey(),
    portfolioId: integer('portfolio_id')
      .notNull()
      .references(() => gliderPortfolios.id),
    tokenId: integer('token_id')
      .notNull()
      .references(() => tokens.id),
    portfolioEthBalanceWei: bigint( 'portfolio_eth_balance_wei', {mode: "bigint"}).notNull(),
    tokenRatioBps: integer('token_ratio_bps').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  }
);

export type GliderPortfolioRebalance = typeof gliderPortfolioRebalances.$inferSelect;
export type NewGliderPortfolioRebalance = typeof gliderPortfolioRebalances.$inferInsert;
