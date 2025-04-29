import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const verificationSources = pgTable(
  'verification_sources',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (t) => [
    uniqueIndex('verification_source_name_unique').on(sql`LOWER(${t.name})`)
  ]
);

export type VerificationSource = typeof verificationSources.$inferSelect;
export type NewVerificationSource = typeof verificationSources.$inferInsert;
