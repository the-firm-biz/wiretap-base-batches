import {
  pgTable,
  serial,
  timestamp,
  integer,
  uniqueIndex,
  text
} from 'drizzle-orm/pg-core';
import { wireTapAccounts } from './accounts/wire-tap-accounts.js';

export const gliderPortfolios = pgTable(
  'glider_portfolios',
  {
    id: serial('id').primaryKey(),
    /** WireTap Account that created the Glider Portfolio */
    wireTapAccountId: integer('wire_tap_account_id')
      .notNull()
      .references(() => wireTapAccounts.id),
    /** Glider's unique Portfolio ID i.e. kqxd14od */
    portfolioId: text('portfolio_id').notNull().unique(),
    /** Session Key Account address for the Glider Portfolio */
    address: text('address').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
  },
  (table) => [
    uniqueIndex('glider_portfolio_wire_tap_account_id_unique').on(
      table.wireTapAccountId
    )
  ]
);

export type GliderPortfolio = typeof gliderPortfolios.$inferSelect;
export type NewGliderPortfolio = typeof gliderPortfolios.$inferInsert;
