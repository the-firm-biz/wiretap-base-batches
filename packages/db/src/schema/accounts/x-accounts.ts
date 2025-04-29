import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { accountEntities } from './account-entities.js';

// Table for X (Twitter) accounts
export const xAccounts = pgTable('x_accounts', {
  id: serial('id').primaryKey(),
  xid: text('xid').notNull().unique(),
  username: text('username').notNull(),
  accountEntityId: integer('account_entity_id')
    .notNull()
    .references(() => accountEntities.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type XAccount = typeof xAccounts.$inferSelect;
export type NewXAccount = typeof xAccounts.$inferInsert;
