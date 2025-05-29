import * as dbModule from '@wiretap/db';
import type { Address } from 'viem';
import { env } from '../../env.js';
import { getAccountEntityIdForAddress } from './get-account-entity-id-for-address.js';
import { expect, describe, beforeEach, it, vi } from 'vitest';

const JOHNY_PRIMARY_ETH_WALLET =
  '0x1111111111111111111111111111111111111111' as Address;

describe('getAccountEntityIdForAddress', () => {
  const db = dbModule.singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const dbPool = new dbModule.PooledDbConnection({
    databaseUrl: env.DATABASE_URL
  });

  const spyEndPoolConnection = vi.spyOn(
    dbModule.PooledDbConnection.prototype,
    'endPoolConnection'
  );

  describe('pool db connection', () => {
    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);
      spyEndPoolConnection.mockClear();
    });

    it('should be closed on success', async () => {
      await expect(
        getAccountEntityIdForAddress({
          tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET
        })
      ).resolves.not.toThrow();
      expect(spyEndPoolConnection).toHaveBeenCalledTimes(1);
    });

    it('should be closed on error', async () => {
      await expect(
        getAccountEntityIdForAddress({
          tokenCreatorAddress: null as unknown as Address
        })
      ).rejects.toThrowError('Cannot read properties of null');
      expect(spyEndPoolConnection).toHaveBeenCalledTimes(1);
    });
  });

  describe('when wallet address has no existing account entity', () => {
    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);
    });

    it('should create new account entity and return its id', async () => {
      const accountEntityId = await getAccountEntityIdForAddress({
        tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET
      });

      // Verify account entity and wallet were created
      const accountEntityResult = await dbModule.getAccountEntity(
        db,
        accountEntityId
      );

      expect(accountEntityResult).toBeDefined();
      expect(accountEntityResult?.accountEntity.id).toBe(accountEntityId);
      expect(accountEntityResult?.wallets).toHaveLength(1);
      expect(accountEntityResult?.wallets[0]?.address).toBe(
        JOHNY_PRIMARY_ETH_WALLET
      );
      expect(accountEntityResult?.wallets[0]?.accountEntityId).toBe(
        accountEntityId
      );
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
      const accountEntityId = await getAccountEntityIdForAddress({
        tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET
      });

      expect(accountEntityId).toBe(existingAccountEntityId);
    });
  });

  afterAll(async () => {
    await dbPool.endPoolConnection();
  });
});
