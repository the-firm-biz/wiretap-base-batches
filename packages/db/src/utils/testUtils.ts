import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  accountEntities,
  farcasterAccounts,
  wallets,
  wireTapAccounts,
  xAccounts
} from '../schema/accounts/index.js';
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
  await db.batch([
    db.delete(pools),
    db.delete(tokens),
    db.delete(accountEntityTrackers),
    db.delete(gliderPortfolios),
    db.delete(wallets),
    db.delete(farcasterAccounts),
    db.delete(xAccounts),
    db.delete(blocks),
    db.delete(wireTapSessionKeys),
    db.delete(wireTapAccounts),

    db.delete(contracts),
    db.delete(accountEntities),
    db.delete(verificationSources),
    db.delete(currencies)
  ]);
};
