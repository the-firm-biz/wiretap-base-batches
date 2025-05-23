import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { accountEntities, farcasterAccounts, wallets, wireTapAccounts, xAccounts } from '../schema/accounts/index.js';
import { contracts } from '../schema/contracts.js';
import { tokens } from '../schema/tokens.js';
import { blocks } from '../schema/blocks.js';
import { verificationSources } from '../schema/verification-sources.js';
import { wireTapSessionKeys } from '../schema/wire-tap-session-keys.js';
import { gliderPortfolios } from '../schema/glider-portfolio.js';
import { accountEntityTrackers } from '../schema/accounts/account-entity-trackers.js';
import { pools } from '../schema/pools.js';
import { currencies } from '../schema/currencies.js';

/**
 * WARNING: This function is unsafe and should only be used in test files
 *
 * Deletes all rows from the database
 */
export const unsafe__clearDbTables = async (db: NeonHttpDatabase) => {
  await db.delete(pools);
  await db.delete(tokens);
  await db.delete(accountEntityTrackers);
  await db.delete(gliderPortfolios);
  await db.delete(wallets);
  await db.delete(farcasterAccounts);
  await db.delete(xAccounts);
  await db.delete(blocks);
  await db.delete(wireTapSessionKeys);
  await db.delete(wireTapAccounts);

  await db.delete(contracts);
  await db.delete(accountEntities);
  await db.delete(verificationSources);
  await db.delete(currencies);
};
