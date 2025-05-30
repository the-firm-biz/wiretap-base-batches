import type {
  HttpDb,
  ServerlessDb,
  ServerlessDbTransaction
} from '@wiretap/db';
import {
  deleteAccountEntities,
  updateAccountEntitiesToPrimaryEntityId
} from '@wiretap/db';

/**
 * Assigns all account entities associated with an array of passed accountEntityIds to one entity ID
 * and deletes the other account entities.
 *
 * @returns The primary entity ID.
 */
export async function handleMultipleAccountEntities(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  accountEntityIds: number[]
): Promise<number> {
  if (accountEntityIds.length === 0) {
    throw new Error('Cannot merge empty array of account entity IDs');
  }

  if (accountEntityIds.length === 1) {
    console.log('Calling updateAccountEntitiesToPrimaryEntityId with 1 entity');
    return accountEntityIds[0]!;
  }

  // Choose primary entity (lowest ID)
  const primaryEntityId = Math.min(...accountEntityIds);
  const entityIdsToMerge = accountEntityIds.filter(
    (id) => id !== primaryEntityId
  );

  const returnedPrimaryEntityId = await updateAccountEntitiesToPrimaryEntityId(
    db,
    primaryEntityId,
    entityIdsToMerge
  );

  await deleteAccountEntities(db, entityIdsToMerge);

  return returnedPrimaryEntityId;
}
