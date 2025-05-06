import path from 'path';
import { fileURLToPath } from 'url';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { env } from '../env.js';
import { PooledDbConnection } from '../client.js';

console.log('🔄 Applying migrations to the database...');

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get a pooled connection for migrations
const dbPool = new PooledDbConnection({ databaseUrl: env.DATABASE_URL });

try {
  // Run the migrator against the database
  await migrate(dbPool.db, {
    migrationsFolder: path.resolve(__dirname, '../../drizzle')
  });
  console.log('✅ Migrations applied successfully!');
} catch (error) {
  console.error('❌ Failed to apply migrations:', error);
  process.exit(1);
} finally {
  // Always close the pooled connection
  await dbPool.endPoolConnection();
  console.log('Database connection closed');
  process.exit(0);
}
