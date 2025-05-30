import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  PooledDbConnection,
  singletonDb,
  unsafe__clearDbTables
} from '@wiretap/db';
import { env } from '../../env.js';
import { handleMultipleAccountEntities } from './handle-multiple-account-entities.js';
import { accountEntities, type AccountEntity } from '@wiretap/db';
import type { NeynarUser } from '@wiretap/utils/server';
import type { Address } from 'viem';

describe('mergeAccountEntities', () => {
  const db = singletonDb({ databaseUrl: env.DATABASE_URL });
  const dbPool = new PooledDbConnection({ databaseUrl: env.DATABASE_URL });

  let testAccountEntity1: AccountEntity;
  let testAccountEntity2: AccountEntity;
  let testAccountEntity3: AccountEntity;

  const mockNeynarUser = {} as NeynarUser;
  const mockTokenCreatorAddress: Address =
    '0x9876543210987654321098765432109876543210';

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

  afterAll(async () => {
    await dbPool.endPoolConnection();
  });

  it('throws error for empty array', async () => {
    await expect(
      dbPool.db.transaction((tx) =>
        mergeAccountEntities(tx, {
          accountEntityIds: [],
          neynarUser: mockNeynarUser,
          tokenCreatorAddress: mockTokenCreatorAddress
        })
      )
    ).rejects.toThrow('Cannot merge empty array of account entity IDs');
  });

  it('returns the single ID when array has one element', async () => {
    const result = await dbPool.db.transaction((tx) =>
      mergeAccountEntities(tx, {
        accountEntityIds: [testAccountEntity1.id],
        neynarUser: mockNeynarUser,
        tokenCreatorAddress: mockTokenCreatorAddress
      })
    );

    expect(result).toBe(testAccountEntity1.id);
  });

  it('throws not implemented error for multiple account entities', async () => {
    await expect(
      dbPool.db.transaction((tx) =>
        mergeAccountEntities(tx, {
          accountEntityIds: [testAccountEntity1.id, testAccountEntity2.id],
          neynarUser: mockNeynarUser,
          tokenCreatorAddress: mockTokenCreatorAddress
        })
      )
    ).rejects.toThrow(
      'Account entity merging not yet implemented - Drizzle version mismatch needs to be resolved'
    );
  });

  it('throws not implemented error for three account entities', async () => {
    await expect(
      dbPool.db.transaction((tx) =>
        mergeAccountEntities(tx, {
          accountEntityIds: [
            testAccountEntity1.id,
            testAccountEntity2.id,
            testAccountEntity3.id
          ],
          neynarUser: mockNeynarUser,
          tokenCreatorAddress: mockTokenCreatorAddress
        })
      )
    ).rejects.toThrow(
      'Account entity merging not yet implemented - Drizzle version mismatch needs to be resolved'
    );
  });

  // TODO: Add tests for actual merging behavior once implementation is complete
  describe('when implementation is complete', () => {
    it.todo('should choose the lowest ID as primary entity');
    it.todo('should reassign all X accounts to primary entity');
    it.todo('should reassign all Farcaster accounts to primary entity');
    it.todo('should reassign all wallets to primary entity');
    it.todo('should delete orphaned account entities');
    it.todo('should handle entities with no associated accounts');
    it.todo('should handle duplicate accounts during merge');
    it.todo('should preserve all data integrity during merge');
  });
});
