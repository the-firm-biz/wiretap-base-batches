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
export function singletonDb(opts: DbClientOptions): HttpDb {
  if (!_db) {
    _db = getDb(opts);
  }
  return _db;
}

/** Integration tests run locally via neon proxy https://neon.tech/guides/local-development-with-neon */
function initLocalNeonProxy(connectionString: string) {
  neonConfig.fetchEndpoint = (host) => {
    const [protocol, port] =
      host === 'db.localtest.me' ? ['http', 4444] : ['https', 443];
    return `${protocol}://${host}:${port}/sql`;
  };
  const connectionStringUrl = new URL(connectionString);
  neonConfig.useSecureWebSocket =
    connectionStringUrl.hostname !== 'db.localtest.me';
  neonConfig.wsProxy = (host) =>
    host === 'db.localtest.me' ? `${host}:4444/v2` : `${host}/v2`;
}

/** Check if db url is local neon proxy https://neon.tech/guides/local-development-with-neon */
function isLocalDatabase(databaseUrl: string) {
  return databaseUrl.includes('db.localtest.me');
}

/**
 * Factory function to create a new db connection every time
 *
 * Used in serverless/edge environments where connections may not be reliable between invocations
 */
export function getDb(opts: DbClientOptions) {
  if (isLocalDatabase(opts.databaseUrl)) {
    initLocalNeonProxy(opts.databaseUrl);
  }
  const sql: NeonQueryFunction<boolean, boolean> = neon(opts.databaseUrl);
  return drizzle(sql);
}

/**
 * Required whenever using transactions
 */
export class PooledDbConnection {
  private readonly pool: Pool;
  public db: ServerlessDb;

  constructor(opts: DbClientOptions) {
    if (isLocalDatabase(opts.databaseUrl)) {
      initLocalNeonProxy(opts.databaseUrl);
    }
    this.pool = new Pool({ connectionString: opts.databaseUrl });
    this.db = drizzleNeonServerless(this.pool);
  }

  public async endPoolConnection() {
    await this.pool.end();
  }
}
