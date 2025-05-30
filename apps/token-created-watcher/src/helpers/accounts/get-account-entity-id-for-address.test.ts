import * as dbModule from '@wiretap/db';
import type { Address } from 'viem';
import { env } from '../../env.js';
import { getAccountEntityIdForAddress } from './get-account-entity-id-for-address.js';
import { expect, describe, beforeEach, it } from 'vitest';

const JOHNY_PRIMARY_ETH_WALLET =
  '0x1111111111111111111111111111111111111111' as Address;

describe('getAccountEntityIdForAddress', () => {
  const db = dbModule.singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const dbPool = new dbModule.PooledDbConnection({
    databaseUrl: env.DATABASE_URL
  });

  describe('when wallet address has no existing account entity', () => {
    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);
    });

    it('should return CreateAccountEntityInput if no account entity exists', async () => {
      const result = await dbPool.db.transaction((tx) =>
        getAccountEntityIdForAddress(tx, {
          tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET
        })
      );

      // Should return CreateAccountEntityInput object
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('newWallets');
      expect((result as any).newWallets).toEqual([
        { address: JOHNY_PRIMARY_ETH_WALLET }
      ]);
    });
  });

  describe('when wallet address has an existing account entity', () => {
    let existingAccountEntityId: number;

    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);

      // Create existing account entity and wallet
      const { accountEntity } = await dbModule.createAccountEntity(dbPool.db, {
        newWallets: [{ address: JOHNY_PRIMARY_ETH_WALLET }]
      });
      existingAccountEntityId = accountEntity.id;
    });

    it('should return existing account entity id', async () => {
      const result = await dbPool.db.transaction((tx) =>
        getAccountEntityIdForAddress(tx, {
          tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET
        })
      );

      expect(typeof result).toBe('number');
      expect(result).toBe(existingAccountEntityId);
    });
  });

  afterAll(async () => {
    await dbPool.endPoolConnection();
  });
});
