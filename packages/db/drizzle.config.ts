import type { Config } from 'drizzle-kit';

/**
 * Config for schema generation.
 * Pushing migrations is handled by calling 'scripts/db_push.ts' (via the deno task 'db:migration-push' or 'db:migration').
 */
export default {
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle'
} satisfies Config;
