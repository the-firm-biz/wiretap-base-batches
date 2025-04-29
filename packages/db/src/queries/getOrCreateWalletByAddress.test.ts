import { eq } from 'drizzle-orm';
import { singletonDb } from '../client.js';
import { walletAddresses, tokenCreatorEntities } from '../schema/accounts.js';
import { env } from '../env.js';
import { getOrCreateWalletByAddress } from './getOrCreateWalletByAddress.js';
import { sweepDbTables } from '../utils/testUtils.js';

const walletAddress = '0xd9aCd656A5f1B519C9E76a2A6092265A74186e58';

describe('getOrCreateWalletByAddress', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeEach(async () => {
    await sweepDbTables(db);
  });

  describe('if wallet does not exist in DB', () => {
    it('saves the wallet into DB', async () => {
      await getOrCreateWalletByAddress(db, walletAddress);
      const dbWallets = await db.select().from(walletAddresses);
      expect(dbWallets.length).toBe(1);
      expect(dbWallets[0]?.address).toBe(walletAddress);
      const tokenCreatorEntity = await db
        .select()
        .from(tokenCreatorEntities)
        .where(eq(tokenCreatorEntities.id, dbWallets[0]!.tokenCreatorEntityId));
      expect(tokenCreatorEntity.length).toBe(1);
      expect(tokenCreatorEntity[0]?.name).toBe(null);
    });
    it('returns inserted DB row', async () => {
      const returnedRow = await getOrCreateWalletByAddress(db, walletAddress);
      expect(returnedRow).toStrictEqual({
        id: expect.any(Number),
        address: walletAddress,
        createdAt: expect.any(Date),
        verificationSourceId: null,
        tokenCreatorEntityId: expect.any(Number)
      });
    });
    it('sets tokenCreatorEntity name if supplied', async () => {
      const tokenCreatorEntityName = 'Test Entity';
      const returnedRow = await getOrCreateWalletByAddress(
        db,
        walletAddress,
        tokenCreatorEntityName
      );
      const tokenCreatorEntity = await db
        .select()
        .from(tokenCreatorEntities)
        .where(eq(tokenCreatorEntities.id, returnedRow.tokenCreatorEntityId));
      expect(tokenCreatorEntity[0]?.name).toBe(tokenCreatorEntityName);
    });
  });

  describe('if wallet exists in DB', () => {
    it('does not save the wallet into DB', async () => {
      await getOrCreateWalletByAddress(db, walletAddress);
      await getOrCreateWalletByAddress(db, walletAddress);
      const dbWallets = await db.select().from(walletAddresses);
      expect(dbWallets.length).toBe(1);
      expect(dbWallets[0]?.address).toBe(walletAddress);
    });
    it('returns existing DB row (exact same address)', async () => {
      const originalRow = await getOrCreateWalletByAddress(db, walletAddress);
      const returnedRow = await getOrCreateWalletByAddress(db, walletAddress);
      expect(returnedRow).toStrictEqual({
        id: originalRow.id,
        address: walletAddress,
        createdAt: originalRow.createdAt,
        verificationSourceId: null,
        tokenCreatorEntityId: originalRow.tokenCreatorEntityId
      });
    });
    it('returns existing DB row (same address, different letter case)', async () => {
      const originalRow = await getOrCreateWalletByAddress(db, walletAddress);
      const returnedRow = await getOrCreateWalletByAddress(
        db,
        walletAddress.toLowerCase() as `0x${string}`
      );
      expect(returnedRow).toStrictEqual({
        id: originalRow.id,
        address: walletAddress,
        createdAt: originalRow.createdAt,
        verificationSourceId: null,
        tokenCreatorEntityId: originalRow.tokenCreatorEntityId
      });
    });
  });

  it('should throw if encountered unexpected error', async () => {
    const badWalletAddress = null as unknown as `0x${string}`; // TODO: ideally we should mock the DB error instead of doing this
    await expect(
      getOrCreateWalletByAddress(db, badWalletAddress)
    ).rejects.toThrow();
  });
});
