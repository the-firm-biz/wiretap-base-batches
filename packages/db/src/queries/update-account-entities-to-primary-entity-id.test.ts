import { PooledDbConnection, singletonDb } from '../client.js';
import { env } from '../env.js';
import { eq } from 'drizzle-orm';
import {
  accountEntities,
  type AccountEntity
} from '../schema/accounts/account-entities.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import {
  farcasterAccounts,
  wallets,
  xAccounts,
  type NewFarcasterAccount,
  type NewWallet,
  type NewXAccount
} from '../schema/index.js';
import { updateAccountEntitiesToPrimaryEntityId } from './update-account-entities-to-primary-entity-id.js';

interface TestAccountData {
  entities: AccountEntity[];
  xAccounts: NewXAccount[];
  farcasterAccounts: NewFarcasterAccount[];
  wallets: NewWallet[];
}

describe('updateAccountEntitiesToPrimaryEntityId', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const dbPool = new PooledDbConnection({ databaseUrl: env.DATABASE_URL });

  let testData: TestAccountData;

  const createTestData = (entities: AccountEntity[]) => ({
    entities,
    xAccounts: [
      {
        xid: 'x-test-xid-1',
        username: 'x-test-username-1',
        accountEntityId: entities[0]!.id
      },
      {
        xid: 'x-test-xid-2',
        username: 'x-test-username-2',
        accountEntityId: entities[1]!.id
      }
    ],
    farcasterAccounts: [
      {
        fid: 12345,
        username: 'farcaster-test-username-1',
        displayName: 'Farcaster Test Display Name 1',
        pfpUrl: 'https://example.com/pfp1.png',
        followerCount: 1000,
        accountEntityId: entities[0]!.id
      },
      {
        fid: 23456,
        username: 'farcaster-test-username-2',
        displayName: 'Farcaster Test Display Name 2',
        pfpUrl: 'https://example.com/pfp2.png',
        followerCount: 2000,
        accountEntityId: entities[1]!.id
      }
    ],
    wallets: [
      {
        address: '0x60C2c576310892d741ac6faFB74D82D3dd49F4B6',
        accountEntityId: entities[0]!.id
      },
      {
        address: '0x70C2c576310892d741ac6faFB74D82D3dd49F4B7',
        accountEntityId: entities[1]!.id
      },
      {
        address: '0x80C2c576310892d741ac6faFB74D82D3dd49F4B7',
        accountEntityId: entities[2]!.id
      }
    ]
  });

  beforeEach(async () => {
    await unsafe__clearDbTables(db);

    // Create test account entities
    const entities = await db
      .insert(accountEntities)
      .values([
        { label: 'Test Entity 1 - All Accounts' },
        { label: 'Test Entity 2 - All Accounts' },
        { label: 'Test Entity 3 - Wallet Only' }
      ])
      .returning();

    testData = createTestData(entities);

    // Insert all test data in batches
    await db.batch([
      db.insert(xAccounts).values(testData.xAccounts),
      db.insert(farcasterAccounts).values(testData.farcasterAccounts),
      db.insert(wallets).values(testData.wallets)
    ]);
  });

  afterAll(async () => {
    await dbPool.endPoolConnection();
  });

  it('updates all account types to primary entity id', async () => {
    const primaryEntityId = testData.entities[0]!.id;
    const entityIdsToMerge = [
      testData.entities[1]!.id,
      testData.entities[2]!.id
    ];

    await updateAccountEntitiesToPrimaryEntityId(
      dbPool.db,
      primaryEntityId,
      entityIdsToMerge
    );

    // Verify all accounts were updated to primary entity
    const [updatedXAccounts, updatedFarcasterAccounts, updatedWallets] =
      await Promise.all([
        db.select().from(xAccounts),
        db.select().from(farcasterAccounts),
        db.select().from(wallets)
      ]);

    expect(updatedXAccounts).toHaveLength(testData.xAccounts.length);
    expect(
      updatedXAccounts.every(
        (account) => account.accountEntityId === primaryEntityId
      )
    ).toBe(true);

    expect(updatedFarcasterAccounts).toHaveLength(
      testData.farcasterAccounts.length
    );
    expect(
      updatedFarcasterAccounts.every(
        (account) => account.accountEntityId === primaryEntityId
      )
    ).toBe(true);

    expect(updatedWallets).toHaveLength(testData.wallets.length);
    expect(
      updatedWallets.every(
        (wallet) => wallet.accountEntityId === primaryEntityId
      )
    ).toBe(true);
  });

  it('handles empty entityIdsToMerge array', async () => {
    const primaryEntityId = testData.entities[0]!.id;
    const entityIdsToMerge: number[] = [];

    // Should not throw and should not change anything
    await expect(
      updateAccountEntitiesToPrimaryEntityId(
        dbPool.db,
        primaryEntityId,
        entityIdsToMerge
      )
    ).resolves.toBeUndefined();

    // Verify data remains unchanged
    const xAccountsAfter = await db.select().from(xAccounts);
    const originalXAccount1 = xAccountsAfter.find(
      (acc) => acc.xid === testData.xAccounts[0]!.xid
    );
    const originalXAccount2 = xAccountsAfter.find(
      (acc) => acc.xid === testData.xAccounts[1]!.xid
    );
    expect(originalXAccount1?.accountEntityId).toBe(testData.entities[0]!.id);
    expect(originalXAccount2?.accountEntityId).toBe(testData.entities[1]!.id);
  });

  it('only updates accounts from specified entity IDs', async () => {
    const primaryEntityId = testData.entities[0]!.id;
    const entityIdsToMerge = [testData.entities[1]!.id]; // Only merge entity 2, not 3

    await updateAccountEntitiesToPrimaryEntityId(
      dbPool.db,
      primaryEntityId,
      entityIdsToMerge
    );

    // Check that entity 1 accounts remain unchanged (they were already on primary)
    const xAccount1 = await db
      .select()
      .from(xAccounts)
      .where(eq(xAccounts.xid, testData.xAccounts[0]!.xid));
    expect(xAccount1[0]?.accountEntityId).toBe(primaryEntityId);

    const farcasterAccount1 = await db
      .select()
      .from(farcasterAccounts)
      .where(eq(farcasterAccounts.fid, testData.farcasterAccounts[0]!.fid));
    expect(farcasterAccount1[0]?.accountEntityId).toBe(primaryEntityId);

    // Check that entity 2 accounts were updated to primary
    const xAccount2 = await db
      .select()
      .from(xAccounts)
      .where(eq(xAccounts.xid, testData.xAccounts[1]!.xid));
    expect(xAccount2[0]?.accountEntityId).toBe(primaryEntityId);

    const farcasterAccount2 = await db
      .select()
      .from(farcasterAccounts)
      .where(eq(farcasterAccounts.fid, testData.farcasterAccounts[1]!.fid));
    expect(farcasterAccount2[0]?.accountEntityId).toBe(primaryEntityId);

    const wallet2 = await db
      .select()
      .from(wallets)
      .where(eq(wallets.address, testData.wallets[1]!.address));
    expect(wallet2[0]?.accountEntityId).toBe(primaryEntityId);

    // Check that entity 3 accounts remain unchanged
    const wallet3 = await db
      .select()
      .from(wallets)
      .where(eq(wallets.address, testData.wallets[2]!.address));
    expect(wallet3[0]?.accountEntityId).toBe(testData.entities[2]!.id);
  });

  it('works within a transaction', async () => {
    const primaryEntityId = testData.entities[0]!.id;
    const entityIdsToMerge = [testData.entities[1]!.id];

    await dbPool.db.transaction(async (tx) => {
      await updateAccountEntitiesToPrimaryEntityId(
        tx,
        primaryEntityId,
        entityIdsToMerge
      );
    });

    // Verify the updates were committed
    const updatedXAccount2 = await db
      .select()
      .from(xAccounts)
      .where(eq(xAccounts.xid, testData.xAccounts[1]!.xid));
    expect(updatedXAccount2[0]?.accountEntityId).toBe(primaryEntityId);

    const updatedFarcasterAccount2 = await db
      .select()
      .from(farcasterAccounts)
      .where(eq(farcasterAccounts.fid, testData.farcasterAccounts[1]!.fid));
    expect(updatedFarcasterAccount2[0]?.accountEntityId).toBe(primaryEntityId);
  });

  it('preserves all other account data during update', async () => {
    const primaryEntityId = testData.entities[0]!.id;
    const entityIdsToMerge = [testData.entities[1]!.id];

    await updateAccountEntitiesToPrimaryEntityId(
      dbPool.db,
      primaryEntityId,
      entityIdsToMerge
    );

    // Verify that only accountEntityId changed, all other data preserved
    const updatedXAccount2 = await db
      .select()
      .from(xAccounts)
      .where(eq(xAccounts.xid, testData.xAccounts[1]!.xid));
    const xAccount = updatedXAccount2[0]!;
    const originalXAccount = testData.xAccounts[1]!;

    expect(xAccount.accountEntityId).toBe(primaryEntityId);
    expect(xAccount.xid).toBe(originalXAccount.xid);
    expect(xAccount.username).toBe(originalXAccount.username);

    const updatedFarcaster2 = await db
      .select()
      .from(farcasterAccounts)
      .where(eq(farcasterAccounts.fid, testData.farcasterAccounts[1]!.fid));
    const farcaster = updatedFarcaster2[0]!;
    const originalFarcaster = testData.farcasterAccounts[1]!;

    expect(farcaster.accountEntityId).toBe(primaryEntityId);
    expect(farcaster.fid).toBe(originalFarcaster.fid);
    expect(farcaster.username).toBe(originalFarcaster.username);
    expect(farcaster.displayName).toBe(originalFarcaster.displayName);
    expect(farcaster.followerCount).toBe(originalFarcaster.followerCount);
  });

  it('throws an error if the primary entity ID is in the list of entities to merge', async () => {
    const primaryEntityId = testData.entities[0]!.id;
    const entityIdsToMerge = [primaryEntityId];

    await expect(
      updateAccountEntitiesToPrimaryEntityId(
        dbPool.db,
        primaryEntityId,
        entityIdsToMerge
      )
    ).rejects.toThrow(
      'Primary entity ID cannot be in the list of entities to merge'
    );
  });
});
