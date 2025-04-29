import { type AnyPgColumn } from 'drizzle-orm/pg-core';
import { sql, type SQL } from 'drizzle-orm';

export function lower(column: AnyPgColumn): SQL {
  return sql`lower(${column})`;
}

/** Case-insensitive equality for strings */
export function lowerEq(column: AnyPgColumn, value: string): SQL {
  return sql`lower(${column}) = ${value.toLowerCase()}`;
}
