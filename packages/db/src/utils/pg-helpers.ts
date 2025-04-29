import { type AnyPgColumn } from 'drizzle-orm/pg-core';
import { sql, type SQL } from 'drizzle-orm';

export function lower(column: AnyPgColumn): SQL {
  return sql`lower(${column})`;
}
