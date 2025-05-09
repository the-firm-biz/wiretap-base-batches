import {
  pgTable,
  timestamp,
  integer,
  bigint,
  primaryKey
} from 'drizzle-orm/pg-core';
import { wireTapAccounts } from './wire-tap-accounts.js';
import { accountEntities } from './account-entities.js';

export const accountEntityTrackers = pgTable(
  'account_entity_trackers',
  {
    /** WireTapAccount doing the tracking */
    trackerWireTapAccountId: integer('tracker_wire_tap_account_id')
      .notNull()
      .references(() => wireTapAccounts.id),
    /** AccountEntity being tracked */
    trackedAccountEntityId: integer('tracked_account_entity_id')
      .notNull()
      .references(() => accountEntities.id),
    /** Maximum amount of ETH that should be allocated if the trackedAccountEntityId deploys a token */
    maxSpend: bigint('max_spend', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
  },
  (table) => [
    primaryKey({
      columns: [table.trackerWireTapAccountId, table.trackedAccountEntityId]
    })
  ]
);

export type AccountEntityTracker = typeof accountEntityTrackers.$inferSelect;
export type NewAccountEntityTracker = typeof accountEntityTrackers.$inferInsert;
