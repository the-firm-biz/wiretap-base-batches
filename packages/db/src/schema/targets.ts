import {
  pgTable,
  serial,
  timestamp,
  integer,
  uniqueIndex,
  bigint
} from 'drizzle-orm/pg-core';
import { wireTapAccounts } from './accounts/wire-tap-accounts.js';
import { accountEntities } from './accounts/account-entities.js';

export const targets = pgTable(
  'targets',
  {
    id: serial('id').primaryKey(),
    /** WireTap Account doing the monitoring */
    wireTapAccountId: integer('wire_tap_account_id')
      .notNull()
      .references(() => wireTapAccounts.id),
    /** Target Account Entity being monitored */
    targetAccountEntityId: integer('target_account_entity_id')
      .notNull()
      .references(() => accountEntities.id),
    /** Maximum amount of ETH that should be allocated if the targetAccountEntityId deploys a token */
    maxSpend: bigint('max_spend', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
  },
  (table) => [
    uniqueIndex('targets_wire_tap_account_target_unique').on(
      table.wireTapAccountId,
      table.targetAccountEntityId
    )
  ]
);

export type Target = typeof targets.$inferSelect;
export type NewTarget = typeof targets.$inferInsert;
