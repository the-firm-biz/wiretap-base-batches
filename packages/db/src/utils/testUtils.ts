import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  farcasterAccounts,
  accountEntities,
  wallets,
  xAccounts,
  wireTapAccounts
} from '../schema/accounts/index.js';
import { contracts } from '../schema/contracts.js';
import { tokens } from '../schema/tokens.js';
import { verificationSources } from '../schema/verification-sources.js';
import { wireTapSessionKeys } from '../schema/wire-tap-session-keys.js';

export const clearDbTables = async (db: NeonHttpDatabase) => {
  await db.delete(tokens);
  await db.delete(wallets);
  await db.delete(farcasterAccounts);
  await db.delete(xAccounts);
  await db.delete(wireTapSessionKeys);
  await db.delete(wireTapAccounts);

  await db.delete(contracts);
  await db.delete(accountEntities);
  await db.delete(verificationSources);
};
