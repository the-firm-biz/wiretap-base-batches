import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { wireTapAccounts } from './accounts/wire-tap-accounts.js';
import { sql } from 'drizzle-orm';

export const wireTapSessionKeys = pgTable(
  'wire_tap_session_keys',
  {
    id: serial('id').primaryKey(),
    wireTapAccountId: integer('wire_tap_account_id')
      .notNull()
      .references(() => wireTapAccounts.id),
    encryptedSessionKey: text('encrypted_session_key').unique().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
  },
  (table) => [
    uniqueIndex('wire_tap_session_keys_wire_tap_account_id_active_unique')
      .on(table.wireTapAccountId)
      .where(sql`${table.isActive} IS TRUE`)
  ]
);

export type WireTapSessionKey = typeof wireTapSessionKeys.$inferSelect;
export type NewWireTapSessionKey = typeof wireTapSessionKeys.$inferInsert;
