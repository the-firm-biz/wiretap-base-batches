import {
  bigint,
  index,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { contracts } from './contracts.js';
import { accountEntities } from './accounts/account-entities.js';
import { lower } from '../utils/pg-helpers.js';
import { blocks } from './blocks.js';

export const tokens = pgTable(
  'tokens',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    symbol: text('symbol').notNull(),
    address: text('address').notNull(),
    imageUrl: text('image_url'),
    score: real('score'),
    deploymentTransactionHash: text('deployment_transaction_hash').notNull(),
    /** Which token contract was used to deploy */
    deploymentContractId: integer('deployment_contract_id')
      .notNull()
      .references(() => contracts.id),
    /** Which entity called the function to create the token */
    accountEntityId: integer('account_entity_id')
      .notNull()
      .references(() => accountEntities.id),
    totalSupply: bigint('total_supply', { mode: 'number' }).notNull(),
    block: bigint('block', { mode: 'number' })
      .notNull()
      .references(() => blocks.number),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    index('tokens_block_idx').on(table.name),
    uniqueIndex('tokens_address_lower_unique').on(lower(table.address))
  ]
);

export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;
