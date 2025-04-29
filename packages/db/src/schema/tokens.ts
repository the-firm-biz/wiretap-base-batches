import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { contracts } from './contracts.js';
import { tokenCreatorEntities } from './accounts.js';
import { lower } from '../utils/pg-helpers.js';

export const tokens = pgTable(
  'tokens',
  {
    id: serial('id').primaryKey(),
    name: text('name'),
    symbol: text('symbol'),
    address: text('address').notNull(),
    /** Which token contract was used to deploy */
    deploymentContractId: integer('deployment_contract_id')
      .notNull()
      .references(() => contracts.id),
    /** Which entity called the function to create the token */
    tokenCreatorEntityId: integer('token_creator_entity_id')
      .notNull()
      .references(() => tokenCreatorEntities.id),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('tokens_address_lower_unique').on(lower(table.address))
  ]
);

export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;
