import { singletonDb } from '../client.js';
import { type NewPool, pools } from '../schema/pools.js';
import { tokens } from '../schema/tokens.js';
import { currencies } from '../schema/currencies.js';
import { env } from '../env.js';
import { getOrCreatePool } from './get-or-create-pool.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { contracts } from '../schema/contracts.js';
import { accountEntities, blocks } from '../schema/index.js';

const newPool: NewPool = {
  address: '0x0000000000000000000000000000000000000000',
  tokenId: 1,
  currencyId: 1,
  feeBps: 300,
  athMcapUsd: 1.25,
  startingMcapUsd: 1.25,
  isPrimary: true
};

describe('getOrCreatePool', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    const [deploymentContract] = await db
      .insert(contracts)
      .values({
        address: '0x0000000000000000000000000000000000000000'
      })
      .returning();
    const [block] = await db
      .insert(blocks)
      .values({
        number: 1234567890,
        timestamp: new Date()
      })
      .returning();
    const [token] = await db
      .insert(tokens)
      .values({
        block: block!.number,
        address: '0x0000000000000000000000000000000000000000',
        deploymentTransactionHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        name: 'Test Token',
        symbol: 'TEST',
        deploymentContractId: deploymentContract!.id,
        accountEntityId: testAccountEntity!.id,
        score: 0.999,
        totalSupply: 100_000_000_000,
        creatorTokenIndex: 1
      })
      .returning();
    const [currency] = await db
      .insert(currencies)
      .values({
        address: '0x0000000000000000000000000000000000000000',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
      })
      .returning();

    newPool.tokenId = token!.id;
    newPool.currencyId = currency!.id;
  });

  describe('if pool does not exist in DB', () => {
    it('saves the pool into DB', async () => {
      await getOrCreatePool(db, newPool);
      const dbPools = await db.select().from(pools);
      expect(dbPools.length).toBe(1);
      expect(dbPools[0]?.address).toBe(newPool.address);
    });
    it('returns inserted DB row', async () => {
      const returnedRow = await getOrCreatePool(db, newPool);
      expect(returnedRow).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: null,
        ...newPool
      });
    });
  });

  describe('if pool exists in DB', () => {
    it('does not save the pool into DB', async () => {
      await getOrCreatePool(db, newPool);
      await getOrCreatePool(db, newPool);
      const dbPools = await db.select().from(pools);
      expect(dbPools.length).toBe(1);
      expect(dbPools[0]?.address).toBe(newPool.address);
    });
    it('returns existing DB row (checksummed address)', async () => {
      const originalRow = await getOrCreatePool(db, newPool);
      const returnedRow = await getOrCreatePool(db, newPool);
      expect(returnedRow).toStrictEqual({
        id: originalRow.id,
        createdAt: originalRow.createdAt,
        updatedAt: originalRow.updatedAt,
        ...newPool
      });
    });
    it('returns existing DB row (non-checksummed address)', async () => {
      const originalRow = await getOrCreatePool(db, newPool);
      const returnedRow = await getOrCreatePool(db, {
        ...newPool,
        address: newPool.address.toLowerCase()
      });
      expect(returnedRow).toStrictEqual({
        id: originalRow.id,
        createdAt: originalRow.createdAt,
        updatedAt: originalRow.updatedAt,
        ...newPool
      });
    });
  });

  it('should throw if encountered unexpected error', async () => {
    vi.spyOn(db, 'insert').mockRejectedValue(new Error('Mock DB Error'));
    await expect(getOrCreatePool(db, newPool)).rejects.toThrow();
    const dbPools = await db.select().from(pools);
    expect(dbPools.length).toBe(0);
  });
});
