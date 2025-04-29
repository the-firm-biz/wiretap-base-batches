import { eq } from 'drizzle-orm';
import { contracts, type NewContract } from '../schema/contracts.js';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { lower } from '../utils/pg-helpers.js';

/**
 * Saves the deployer address to the DB if it doesn't exist, otherwise returns the existing row
 * Note: any unexpected errors should be handled by the consumer
 */
export const getOrCreateDeployerContract = async (
  db: NeonHttpDatabase,
  newContract: NewContract
) => {
  const [existingContract] = await db
    .select()
    .from(contracts)
    .where(eq(lower(contracts.address), newContract.address.toLowerCase()));
  if (existingContract) {
    return existingContract;
  }
  const [insertedRow] = await db
    .insert(contracts)
    .values(newContract)
    .returning();

  if (!insertedRow) {
    throw new Error('getOrCreateDeployerContract returned an empty array');
  }
  return insertedRow;
};
