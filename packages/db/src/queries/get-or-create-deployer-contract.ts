import { contracts, type NewContract } from '../schema/contracts.js';
import { lowerEq } from '../utils/pg-helpers.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

/**
 * Saves the deployer address to the DB if it doesn't exist, otherwise returns the existing row
 * Note: any unexpected errors should be handled by the consumer
 */
export const getOrCreateDeployerContract = async (
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newContract: NewContract
) => {
  const [existingContract] = await db
    .select()
    .from(contracts)
    .where(lowerEq(contracts.address, newContract.address));

  if (existingContract) {
    return existingContract;
  }

  const [createdContract] = await db
    .insert(contracts)
    .values(newContract)
    .returning();

  if (!createdContract) {
    throw new Error(
      'WiretapDbError:getOrCreateDeployerContract - failed to create Contract (query returned 0 rows)'
    );
  }

  return createdContract;
};
