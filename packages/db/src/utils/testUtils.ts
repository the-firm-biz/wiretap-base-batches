import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  farcasterAccounts,
  accountEntities,
  wallets,
  xAccounts
} from '../schema/accounts/index.js';
import { contracts } from '../schema/contracts.js';
import { tokens } from '../schema/tokens.js';
import { blocks } from '../schema/blocks.js';
import { verificationSources } from '../schema/verification-sources.js';

/**
 * WARNING: This function is unsafe and should only be used in test files
 *
 * Deletes all rows from the database
 */
export const unsafe__clearDbTables = async (db: NeonHttpDatabase) => {
  await db.delete(tokens);
  await db.delete(wallets);
  await db.delete(farcasterAccounts);
  await db.delete(xAccounts);
  await db.delete(blocks);

  await db.delete(contracts);
  await db.delete(accountEntities);
  await db.delete(verificationSources);
};
