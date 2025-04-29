import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { verificationSources } from './verification-sources.js';
import { lower } from '../utils/pg-helpers.js';

// Table for token creator entities
export const tokenCreatorEntities = pgTable('token_creator_entities', {
  id: serial('id').primaryKey(),
  name: text('name'), // Optional identifier for the entity
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type TokenCreatorEntity = typeof tokenCreatorEntities.$inferSelect;
export type NewTokenCreatorEntity = typeof tokenCreatorEntities.$inferInsert;

// Table for Farcaster accounts
export const farcasterAccounts = pgTable('farcaster_accounts', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  fid: integer('fid').notNull().unique(),
  tokenCreatorEntityId: integer('token_creator_entity_id')
    .notNull()
    .references(() => tokenCreatorEntities.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type FarcasterAccount = typeof farcasterAccounts.$inferSelect;
export type NewFarcasterAccount = typeof farcasterAccounts.$inferInsert;

// Table for X (Twitter) accounts
export const xAccounts = pgTable('x_accounts', {
  id: serial('id').primaryKey(),
  xid: text('xid').notNull().unique(),
  username: text('username').notNull(),
  tokenCreatorEntityId: integer('token_creator_entity_id')
    .notNull()
    .references(() => tokenCreatorEntities.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type XAccount = typeof xAccounts.$inferSelect;
export type NewXAccount = typeof xAccounts.$inferInsert;

// Table for wallet addresses
export const walletAddresses = pgTable(
  'wallet_addresses',
  {
    id: serial('id').primaryKey(),
    address: text('address').notNull(),
    tokenCreatorEntityId: integer('token_creator_entity_id')
      .notNull()
      .references(() => tokenCreatorEntities.id),
    verificationSourceId: integer('verification_source_id').references(
      () => verificationSources.id
    ),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('wallet_addresses_address_lower_unique').on(
      lower(table.address)
    )
  ]
);

export type WalletAddress = typeof walletAddresses.$inferSelect;
export type NewWalletAddress = typeof walletAddresses.$inferInsert;
