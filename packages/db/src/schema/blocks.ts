import { bigint, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const blocks = pgTable('blocks', {
  number: bigint('number', { mode: 'number' }).primaryKey(),
  timestamp: timestamp('timestamp'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
