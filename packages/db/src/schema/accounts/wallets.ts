import { lower } from '../../utils/pg-helpers.js';
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { verificationSources } from '../verification-sources.js';
import { accountEntities } from './account-entities.js';

// Table for wallet addresses
export const wallets = pgTable(
  'wallets',
  {
    id: serial('id').primaryKey(),
    address: text('address').notNull(),
    accountEntityId: integer('account_entity_id')
      .notNull()
      .references(() => accountEntities.id),
    verificationSourceId: integer('verification_source_id').references(
      () => verificationSources.id
    ),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('wallets_address_lower_unique').on(lower(table.address))
  ]
);

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
