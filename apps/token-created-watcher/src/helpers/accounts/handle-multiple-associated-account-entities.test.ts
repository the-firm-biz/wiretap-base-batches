import { describe, it, expect, beforeEach } from 'vitest';
import {
  singletonDb,
  unsafe__clearDbTables,
  accountEntities,
  xAccounts,
  farcasterAccounts,
  wallets,
  type AccountEntity
} from '@wiretap/db';
import { env } from '../../env.js';
import { handleMultipleAssociatedAccountEntities } from './handle-multiple-associated-account-entities.js';

describe('handleMultipleAssociatedAccountEntities', () => {
  const db = singletonDb({ databaseUrl: env.DATABASE_URL });

  let testAccountEntity1: AccountEntity;
  let testAccountEntity2: AccountEntity;
  let testAccountEntity3: AccountEntity;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);

    // Create test account entities
    const entities = await db
      .insert(accountEntities)
      .values([
        { label: 'Test Entity 1' },
        { label: 'Test Entity 2' },
        { label: 'Test Entity 3' }
      ])
      .returning();

    testAccountEntity1 = entities[0]!;
    testAccountEntity2 = entities[1]!;
    testAccountEntity3 = entities[2]!;
  });

  it('throws error for empty array', async () => {
    await expect(
      handleMultipleAssociatedAccountEntities(db, [])
    ).rejects.toThrow('Cannot merge empty array of account entity IDs');
  });

  it('returns the single ID when array has one element', async () => {
    const result = await handleMultipleAssociatedAccountEntities(db, [
      testAccountEntity1.id
    ]);

    expect(result).toBe(testAccountEntity1.id);
  });

  it('merges two account entities, keeping the one with lowest ID', async () => {
    // Create associated records for both entities
    await db.insert(xAccounts).values([
      { accountEntityId: testAccountEntity1.id, xid: 'x1', username: 'user1' },
      { accountEntityId: testAccountEntity2.id, xid: 'x2', username: 'user2' }
    ]);

    await db.insert(farcasterAccounts).values([
      { accountEntityId: testAccountEntity1.id, fid: 123, username: 'fuser1' },
      { accountEntityId: testAccountEntity2.id, fid: 456, username: 'fuser2' }
    ]);

    await db.insert(wallets).values([
      {
        accountEntityId: testAccountEntity1.id,
        address: '0x1111111111111111111111111111111111111111'
      },
      {
        accountEntityId: testAccountEntity2.id,
        address: '0x2222222222222222222222222222222222222222'
      }
    ]);

    const primaryId = Math.min(testAccountEntity1.id, testAccountEntity2.id);
    const result = await handleMultipleAssociatedAccountEntities(db, [
      testAccountEntity1.id,
      testAccountEntity2.id
    ]);

    expect(result).toBe(primaryId);

    // Verify all accounts were reassigned to primary entity
    const xAccountsAfter = await db.select().from(xAccounts);
    const farcasterAccountsAfter = await db.select().from(farcasterAccounts);
    const walletsAfter = await db.select().from(wallets);

    expect(xAccountsAfter).toHaveLength(2);
    expect(farcasterAccountsAfter).toHaveLength(2);
    expect(walletsAfter).toHaveLength(2);

    // All should be assigned to primary entity
    expect(
      xAccountsAfter.every((acc) => acc.accountEntityId === primaryId)
    ).toBe(true);
    expect(
      farcasterAccountsAfter.every((acc) => acc.accountEntityId === primaryId)
    ).toBe(true);
    expect(walletsAfter.every((acc) => acc.accountEntityId === primaryId)).toBe(
      true
    );

    // Verify orphaned entity was deleted
    const entitiesAfter = await db.select().from(accountEntities);
    expect(entitiesAfter).toHaveLength(2); // Should have 1 primary + 1 unused entity
    expect(entitiesAfter.some((entity) => entity.id === primaryId)).toBe(true);
  });

  it('merges three account entities, keeping the one with lowest ID', async () => {
    // Create associated records for all three entities
    await db.insert(xAccounts).values([
      { accountEntityId: testAccountEntity1.id, xid: 'x1', username: 'user1' },
      { accountEntityId: testAccountEntity2.id, xid: 'x2', username: 'user2' },
      { accountEntityId: testAccountEntity3.id, xid: 'x3', username: 'user3' }
    ]);

    const primaryId = Math.min(
      testAccountEntity1.id,
      testAccountEntity2.id,
      testAccountEntity3.id
    );
    const result = await handleMultipleAssociatedAccountEntities(db, [
      testAccountEntity1.id,
      testAccountEntity2.id,
      testAccountEntity3.id
    ]);

    expect(result).toBe(primaryId);

    // Verify all accounts were reassigned to primary entity
    const xAccountsAfter = await db.select().from(xAccounts);
    expect(xAccountsAfter).toHaveLength(3);
    expect(
      xAccountsAfter.every((acc) => acc.accountEntityId === primaryId)
    ).toBe(true);

    // Verify orphaned entities were deleted
    const entitiesAfter = await db.select().from(accountEntities);
    expect(entitiesAfter).toHaveLength(1); // Should have only the primary entity
    expect(entitiesAfter[0]!.id).toBe(primaryId);
  });

  it('handles entities with no associated accounts', async () => {
    const result = await handleMultipleAssociatedAccountEntities(db, [
      testAccountEntity1.id,
      testAccountEntity2.id
    ]);

    const primaryId = Math.min(testAccountEntity1.id, testAccountEntity2.id);
    expect(result).toBe(primaryId);

    // Verify orphaned entity was deleted even with no associated accounts
    const entitiesAfter = await db.select().from(accountEntities);
    expect(entitiesAfter).toHaveLength(2); // Should have 1 primary + 1 unused entity
    expect(entitiesAfter.some((entity) => entity.id === primaryId)).toBe(true);
  });

  it('preserves data integrity during merge with mixed account types', async () => {
    // Create mixed associated records
    await db
      .insert(xAccounts)
      .values([
        { accountEntityId: testAccountEntity1.id, xid: 'x1', username: 'user1' }
      ]);

    await db
      .insert(farcasterAccounts)
      .values([
        { accountEntityId: testAccountEntity2.id, fid: 456, username: 'fuser2' }
      ]);

    await db.insert(wallets).values([
      {
        accountEntityId: testAccountEntity1.id,
        address: '0x1111111111111111111111111111111111111111'
      },
      {
        accountEntityId: testAccountEntity2.id,
        address: '0x2222222222222222222222222222222222222222'
      }
    ]);

    const primaryId = Math.min(testAccountEntity1.id, testAccountEntity2.id);
    const result = await handleMultipleAssociatedAccountEntities(db, [
      testAccountEntity1.id,
      testAccountEntity2.id
    ]);

    expect(result).toBe(primaryId);

    // Verify all accounts were reassigned correctly
    const xAccountsAfter = await db.select().from(xAccounts);
    const farcasterAccountsAfter = await db.select().from(farcasterAccounts);
    const walletsAfter = await db.select().from(wallets);

    expect(xAccountsAfter).toHaveLength(1);
    expect(farcasterAccountsAfter).toHaveLength(1);
    expect(walletsAfter).toHaveLength(2);

    // All should be assigned to primary entity
    expect(xAccountsAfter[0]!.accountEntityId).toBe(primaryId);
    expect(farcasterAccountsAfter[0]!.accountEntityId).toBe(primaryId);
    expect(walletsAfter.every((acc) => acc.accountEntityId === primaryId)).toBe(
      true
    );

    // Verify data integrity - original data should be preserved
    expect(xAccountsAfter[0]!.username).toBe('user1');
    expect(farcasterAccountsAfter[0]!.username).toBe('fuser2');
  });
});
