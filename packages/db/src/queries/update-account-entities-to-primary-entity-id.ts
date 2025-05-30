import type {
  HttpDb,
  ServerlessDb,
  ServerlessDbTransaction
} from '@wiretap/db';
import { inArray } from 'drizzle-orm';
import { xAccounts, farcasterAccounts, wallets } from '@wiretap/db';

export async function updateAccountEntitiesToPrimaryEntityId(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  primaryEntityId: number,
  entityIdsToMerge: number[]
): Promise<number> {
  if (entityIdsToMerge.length === 0) {
    return primaryEntityId;
  }

  if (entityIdsToMerge.includes(primaryEntityId)) {
    throw new Error(
      'Primary entity ID cannot be in the list of entities to merge'
    );
  }

  await Promise.all([
    // X accounts
    db
      .update(xAccounts)
      .set({ accountEntityId: primaryEntityId })
      .where(inArray(xAccounts.accountEntityId, entityIdsToMerge)),

    // Farcaster accounts
    db
      .update(farcasterAccounts)
      .set({ accountEntityId: primaryEntityId })
      .where(inArray(farcasterAccounts.accountEntityId, entityIdsToMerge)),

    // Wallets
    db
      .update(wallets)
      .set({ accountEntityId: primaryEntityId })
      .where(inArray(wallets.accountEntityId, entityIdsToMerge))
  ]);

  return primaryEntityId;
}
