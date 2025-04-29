import { singletonDb } from '../client.js';
import { tokens } from '../schema/tokens.js';
import { tokenCreatorEntities } from '../schema/accounts.js';
import { contracts } from '../schema/contracts.js';
import { env } from '../env.js';
import { getOrCreateToken } from './getOrCreateToken.js';
import { sweepDbTables } from '../utils/testUtils.js';

const newToken = {
  address: '0x60C2c576310892d741ac6faFB74D82D3dd49F4B6',
  name: 'Test Token',
  symbol: 'TEST',
  deploymentContractId: 1,
  tokenCreatorEntityId: 1
};

describe('getOrCreateToken', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeEach(async () => {
    await sweepDbTables(db);
    const [contract] = await db
      .insert(contracts)
      .values({
        address: '0xd9aCd656A5f1B519C9E76a2A6092265A74186e58'
      })
      .returning();
    const [tokenCreatorEntity] = await db
      .insert(tokenCreatorEntities)
      .values({
        name: 'Test Entity'
      })
      .returning();
    newToken.deploymentContractId = contract!.id;
    newToken.tokenCreatorEntityId = tokenCreatorEntity!.id;
  });

  describe('if token does not exist in DB', () => {
    it('saves the token into DB', async () => {
      await getOrCreateToken(db, newToken);
      const dbTokens = await db.select().from(tokens);
      expect(dbTokens.length).toBe(1);
      expect(dbTokens[0]?.address).toBe(newToken.address);
    });
    it('returns inserted DB row', async () => {
      const returnedRow = await getOrCreateToken(db, newToken);
      expect(returnedRow).toStrictEqual({
        id: expect.any(Number),
        name: newToken.name,
        symbol: newToken.symbol,
        address: newToken.address,
        deploymentContractId: newToken.deploymentContractId,
        tokenCreatorEntityId: newToken.tokenCreatorEntityId,
        createdAt: expect.any(Date)
      });
    });
  });

  describe('if token exists in DB', () => {
    it('does not save the token into DB', async () => {
      await getOrCreateToken(db, newToken);
      await getOrCreateToken(db, newToken);
      const dbTokens = await db.select().from(tokens);
      expect(dbTokens.length).toBe(1);
      expect(dbTokens[0]?.address).toBe(newToken.address);
    });
    it('returns existing DB row (exact same address)', async () => {
      const originalRow = await getOrCreateToken(db, newToken);
      const returnedRow = await getOrCreateToken(db, newToken);
      expect(returnedRow).toStrictEqual({
        id: originalRow.id,
        name: newToken.name,
        symbol: newToken.symbol,
        address: newToken.address,
        deploymentContractId: newToken.deploymentContractId,
        tokenCreatorEntityId: newToken.tokenCreatorEntityId,
        createdAt: originalRow.createdAt
      });
    });
    it('returns existing DB row (same address, different letter case)', async () => {
      const originalRow = await getOrCreateToken(db, newToken);
      const returnedRow = await getOrCreateToken(db, {
        ...newToken,
        address: newToken.address.toLowerCase()
      });
      expect(returnedRow).toStrictEqual({
        id: originalRow.id,
        name: newToken.name,
        symbol: newToken.symbol,
        address: newToken.address,
        deploymentContractId: newToken.deploymentContractId,
        tokenCreatorEntityId: newToken.tokenCreatorEntityId,
        createdAt: originalRow.createdAt
      });
    });
  });

  it('should throw if encountered unexpected error', async () => {
    // TODO: ideally we should mock the DB error instead of doing this
    const badNewToken = {
      ...newToken,
      address: null as unknown as `0x${string}`
    };
    await expect(getOrCreateToken(db, badNewToken)).rejects.toThrow();
    const dbTokens = await db.select().from(tokens);
    expect(dbTokens.length).toBe(0);
  });
});
