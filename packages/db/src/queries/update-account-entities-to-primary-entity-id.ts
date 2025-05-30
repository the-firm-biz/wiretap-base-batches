import type { ServerlessDb } from '@wiretap/db';
import { inArray } from 'drizzle-orm';
import {
  xAccounts,
  farcasterAccounts,
  wallets,
  wireTapAccounts
} from '@wiretap/db';

export async function updateAccountEntitiesToPrimaryEntityId(
  tx: ServerlessDb,
  primaryEntityId: number,
  entityIdsToMerge: number[]
): Promise<void> {
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
      .where(inArray(wallets.accountEntityId, entityIdsToMerge)),

    // Update WireTapAccounts
    tx
      .update(wireTapAccounts)
      .set({ accountEntityId: primaryEntityId })
      .where(inArray(wireTapAccounts.accountEntityId, entityIdsToMerge))
  ]);
}
