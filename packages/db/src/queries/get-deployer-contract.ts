import { contracts } from '../schema/contracts.js';
import { lowerEq } from '../utils/pg-helpers.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';

/**
 * Returns the existing row for the deployer contract
 */
export const getDeployerContract = async (
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  address: string
) => {
  const [existingContract] = await db
    .select()
    .from(contracts)
    .where(lowerEq(contracts.address, address));

  return existingContract;
};
