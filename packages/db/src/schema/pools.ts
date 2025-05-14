import {
  boolean,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { lower } from '../utils/pg-helpers.js';
import { tokens } from './tokens.js';
import { currencies } from './currencies.js';

export const pools = pgTable(
  'pools',
  {
    id: serial('id').primaryKey(),
    tokenId: integer('token_id')
      .notNull()
      .references(() => tokens.id),
    currencyId: integer('currency_id')
      .notNull()
      .references(() => currencies.id),
    address: text('pool_address').notNull(),
    /** Whether this is the pool at the time of token creation */
    isPrimary: boolean('is_primary').notNull(),
    feeBps: integer('fee_bps').notNull(),
    /** All time high market cap in USD */
    athMcapUsd: real('ath_mcap_usd').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
  },
  (table) => [
    uniqueIndex('pools_address_lower_unique').on(lower(table.address))
  ]
);

export type Pool = typeof pools.$inferSelect;
export type NewPool = typeof pools.$inferInsert;
