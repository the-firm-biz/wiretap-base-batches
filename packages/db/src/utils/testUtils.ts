import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  farcasterAccounts,
  tokenCreatorEntities,
  walletAddresses,
  xAccounts
} from '../schema/accounts.js';
import { contracts } from '../schema/contracts.js';
import { tokens } from '../schema/tokens.js';
import { verificationSources } from '../schema/verification-sources.js';

export const sweepDbTables = async (db: NeonHttpDatabase) => {
  await db.delete(tokens);
  await db.delete(walletAddresses);
  await db.delete(farcasterAccounts);
  await db.delete(xAccounts);

  await db.delete(contracts);
  await db.delete(tokenCreatorEntities);
  await db.delete(verificationSources);
};
