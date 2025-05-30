import type { ServerlessDb } from '@wiretap/db';
import type { NeynarUser } from '@wiretap/utils/server';
import type { Address } from 'viem';

interface MergeAccountEntitiesParams {
  accountEntityIds: number[];
  neynarUser: NeynarUser;
  tokenCreatorAddress: Address | null;
}

export function mergeAccountEntities(
  tx: ServerlessDb,
  { accountEntityIds }: MergeAccountEntitiesParams
): Promise<number> {
  if (accountEntityIds.length === 0) {
    throw new Error('Cannot merge empty array of account entity IDs');
  }

  if (accountEntityIds.length === 1) {
    return Promise.resolve(accountEntityIds[0]!);
  }

  // TODO: Implement actual merging once Drizzle version mismatch is resolved
  throw new Error(
    'Account entity merging not yet implemented - Drizzle version mismatch needs to be resolved'
  );
}
