import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { lower } from '../utils/pg-helpers.js';

export const contracts = pgTable(
  'contracts',
  {
    id: serial('id').primaryKey(),
    address: text('address').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('contracts_address_lower_unique').on(lower(table.address))
  ]
);

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
