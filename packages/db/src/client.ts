import {
  neon,
  neonConfig,
  type NeonQueryFunction,
  Pool
} from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  drizzle as drizzleNeonServerless,
  type NeonDatabase,
  type NeonQueryResultHKT
} from 'drizzle-orm/neon-serverless';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { type ExtractTablesWithRelations } from 'drizzle-orm';

export type HttpDb = NeonHttpDatabase<Record<string, never>>;
export type ServerlessDb = NeonDatabase<Record<string, never>>;
export type ServerlessDbTransaction = PgTransaction<
  NeonQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

export interface DbClientOptions {
  databaseUrl: string;
}

/**
 * Singleton db connection
 *
 * Used in traditional server environments where a long-lived connection is possible.
 */
let _db: NeonHttpDatabase;
export function singletonDb(opts: DbClientOptions) {
  if (!_db) {
    _db = getDb(opts);
  }
  return _db;
}

/**
 * Factory function to create a new db connection every time
 *
 * Used in serverless/edge environments where connections may not be reliable between invocations
 */
export function getDb(opts: DbClientOptions) {
  // Integration tests run locally via neon proxy https://neon.tech/guides/local-development-with-neon
  if (opts.databaseUrl.includes('db.localtest.me')) {
    neonConfig.fetchEndpoint = (host) => {
      const [protocol, port] =
        host === 'db.localtest.me' ? ['http', 4444] : ['https', 443];
      return `${protocol}://${host}:${port}/sql`;
    };
  }
  const sql: NeonQueryFunction<boolean, boolean> = neon(opts.databaseUrl);
  return drizzle(sql);
}

/**
 * Required whenever using transactions
 *
 * Returns a pooled db connection and a cleanup function to end the connection
 */
export function getPoolDb(opts: DbClientOptions): {
  poolDb: ServerlessDb;
  endPoolConnection: () => Promise<void>;
} {
  const pool = new Pool({ connectionString: opts.databaseUrl });
  pool.on('error', (err: Error) => console.error(err));

  return {
    poolDb: drizzleNeonServerless(pool),
    endPoolConnection: async () => {
      await pool.end();
    }
  };
}
