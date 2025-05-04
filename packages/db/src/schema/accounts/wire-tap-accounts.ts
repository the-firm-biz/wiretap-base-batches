import { pgTable, serial, timestamp, integer } from 'drizzle-orm/pg-core';
import { accountEntities } from './account-entities.js';

export const wireTapAccounts = pgTable('wire_tap_accounts', {
  id: serial('id').primaryKey(),
  accountEntityId: integer('account_entity_id')
    .notNull()
    .references(() => accountEntities.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
});

export type WireTapAccount = typeof wireTapAccounts.$inferSelect;
export type NewWireTapAccount = typeof wireTapAccounts.$inferInsert;
