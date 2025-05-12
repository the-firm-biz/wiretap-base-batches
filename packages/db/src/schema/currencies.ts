import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { lower } from '../utils/pg-helpers.js';

export const currencies = pgTable(
  'currencies',
  {
    id: serial('id').primaryKey(),
    address: text('address').notNull(),
    name: text('name').notNull(),
    symbol: text('symbol').notNull(),
    decimals: integer('decimals').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('currencies_address_lower_unique').on(lower(table.address))
  ]
);

export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
