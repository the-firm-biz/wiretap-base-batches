import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { accountEntities } from './account-entities.js';

// Table for Farcaster accounts
export const farcasterAccounts = pgTable('farcaster_accounts', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  fid: integer('fid').notNull().unique(),
  accountEntityId: integer('account_entity_id')
    .notNull()
    .references(() => accountEntities.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type FarcasterAccount = typeof farcasterAccounts.$inferSelect;
export type NewFarcasterAccount = typeof farcasterAccounts.$inferInsert;
