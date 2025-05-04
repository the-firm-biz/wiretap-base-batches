import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { wireTapAccounts } from './wire-tap-accounts.js';

export const wireTapSessionKeys = pgTable('wire_tap_session_keys', {
  id: serial('id').primaryKey(),
  wireTapAccountId: integer('wire_tap_account_id')
    .notNull()
    .references(() => wireTapAccounts.id),
  encryptedSessionKey: text('encrypted_session_key').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
});

export type WireTapSessionKey = typeof wireTapSessionKeys.$inferSelect;
export type NewWireTapSessionKey = typeof wireTapSessionKeys.$inferInsert;
