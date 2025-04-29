import type { Config } from 'drizzle-kit';

/**
 * Config for local integration tests (e.g. migrating local DB)
 */
export default {
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: 'postgres://postgres:postgres@127.0.0.1:5432/wiretap-test-db'
  }
} satisfies Config;
