import { contracts } from '../schema/contracts.js';
import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { getOrCreateDeployerContract } from './get-or-create-deployer-contract.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';

const newDeployer = {
  address: '0xd9aCd656A5f1B519C9E76a2A6092265A74186e58'
};

describe('getOrCreateDeployerContract', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('if deployer does not exist in DB', () => {
    it('saves the deployer into DB', async () => {
      await getOrCreateDeployerContract(db, newDeployer);
      const dbContracts = await db.select().from(contracts);
      expect(dbContracts.length).toBe(1);
      expect(dbContracts[0]?.address).toBe(newDeployer.address);
    });
    it('returns inserted DB row', async () => {
      const returnedRow = await getOrCreateDeployerContract(db, newDeployer);
      expect(returnedRow).toStrictEqual({
        id: expect.any(Number),
        address: newDeployer.address,
        createdAt: expect.any(Date)
      });
    });
  });

  describe('if deployer exists in DB', () => {
    it('does not save the deployer into DB (same address)', async () => {
      await getOrCreateDeployerContract(db, newDeployer);
      await getOrCreateDeployerContract(db, newDeployer);
      const dbContracts = await db.select().from(contracts);
      expect(dbContracts.length).toBe(1);
      expect(dbContracts[0]?.address).toBe(newDeployer.address);
    });
    it('returns existing DB row (exact same address)', async () => {
      const originalRow = await getOrCreateDeployerContract(db, newDeployer);
      const returnedRow = await getOrCreateDeployerContract(db, newDeployer);
      expect(returnedRow).toStrictEqual({
        id: originalRow.id,
        address: newDeployer.address,
        createdAt: originalRow.createdAt
      });
    });
    it('returns existing DB row (same address, different letter case)', async () => {
      const originalRow = await getOrCreateDeployerContract(db, newDeployer);
      const returnedRow = await getOrCreateDeployerContract(db, {
        ...newDeployer,
        address: newDeployer.address.toLowerCase()
      });
      expect(returnedRow).toStrictEqual({
        id: originalRow.id,
        address: newDeployer.address,
        createdAt: originalRow.createdAt
      });
    });
  });

  it('should throw if encountered unexpected error', async () => {
    vi.spyOn(db, 'insert').mockRejectedValue(new Error('Mock DB Error'));
    await expect(
      getOrCreateDeployerContract(db, newDeployer)
    ).rejects.toThrow();
    const dbContracts = await db.select().from(contracts);
    expect(dbContracts.length).toBe(0);
  });
});
