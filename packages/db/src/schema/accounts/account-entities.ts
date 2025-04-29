import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Table which joins all other account tables to a single entity.
 */
export const accountEntities = pgTable('account_entities', {
  id: serial('id').primaryKey(),
  label: text('label'), // Optional identifier for the entity
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type AccountEntity = typeof accountEntities.$inferSelect;
export type NewAccountEntity = typeof accountEntities.$inferInsert;
