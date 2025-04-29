console.log('🔄 Generating database migrations...');

// Import required modules
import { execSync } from 'child_process';
import process from 'process';

try {
  // "Why NODE_OPTIONS='--import tsx'? https://github.com/drizzle-team/drizzle-orm/issues/849#issuecomment-1805634538
  execSync("NODE_OPTIONS='--import tsx' drizzle-kit generate", {
    stdio: 'inherit' // Forward stdout, stderr, and stdin
  });

  console.log('✅ Migrations generated successfully!');
  process.exit(0);
} catch {
  console.error("❌ Failed to generate database migrations :'(");
  process.exit(1);
}
