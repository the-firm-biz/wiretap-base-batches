import type { ServerlessDb } from '@wiretap/db';
import { inArray } from 'drizzle-orm';
import { xAccounts, farcasterAccounts, wallets } from '@wiretap/db';

export async function updateAccountEntitiesToPrimaryEntityId(
  tx: ServerlessDb,
  primaryEntityId: number,
  entityIdsToMerge: number[]
): Promise<void> {
  if (entityIdsToMerge.length === 0) {
    return;
  }

  if (entityIdsToMerge.includes(primaryEntityId)) {
    throw new Error(
      'Primary entity ID cannot be in the list of entities to merge'
    );
  }

  await Promise.all([
    // Update X accounts
    tx
      .update(xAccounts)
      .set({ accountEntityId: primaryEntityId })
      .where(inArray(xAccounts.accountEntityId, entityIdsToMerge)),

    // Update Farcaster accounts
    tx
      .update(farcasterAccounts)
      .set({ accountEntityId: primaryEntityId })
      .where(inArray(farcasterAccounts.accountEntityId, entityIdsToMerge)),

    // Update Wallets
    tx
      .update(wallets)
      .set({ accountEntityId: primaryEntityId })
      .where(inArray(wallets.accountEntityId, entityIdsToMerge))
  ]);
}
