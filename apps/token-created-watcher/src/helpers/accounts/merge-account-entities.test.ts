import type { Address } from 'viem';
import type { NeynarUser } from '@wiretap/utils/server';
import * as dbModule from '@wiretap/db';
import { env } from '../../env.js';
import { expect, describe, beforeEach, it, vi } from 'vitest';
import { getAccountEntityIdWithNeynarUserAndAddress } from './get-account-entity-id-with-neynar-user-and-address.js';
import { TokenIndexerError } from '../../errors.js';

const JOHNY_PRIMARY_ETH_WALLET =
  '0x1111111111111111111111111111111111111111' as Address;
const JOHNY_SECONDARY_ETH_WALLET =
  '0x2222222222222222222222222222222222222222' as Address;
const JOHNY_TERTIARY_ETH_WALLET =
  '0x3333333333333333333333333333333333333333' as Address;

const JOHNY_FIRST_X_ACCOUNT = 'johny_first_xaccount';
const JOHNY_SECOND_X_ACCOUNT = 'johny_second_xaccount';

const testNeynarUser: NeynarUser = {
  fid: 11111,
  username: 'test_neynar_user',
  object: 'user',
  custody_address: '0x0000000000000000000000000000000000000000',
  profile: {
    bio: {
      text: 'Test Neynar User'
    }
  },
  follower_count: 100,
  following_count: 100,
  verifications: [],
  verified_addresses: {
    eth_addresses: [
      JOHNY_PRIMARY_ETH_WALLET,
      JOHNY_SECONDARY_ETH_WALLET,
      JOHNY_TERTIARY_ETH_WALLET
    ],
    sol_addresses: [],
    primary: {
      eth_address: JOHNY_PRIMARY_ETH_WALLET,
      sol_address: '0x0000000000000000000000000000000000000000'
    }
  },
  verified_accounts: [
    {
      platform: 'x',
      username: JOHNY_FIRST_X_ACCOUNT
    },
    {
      platform: 'x',
      username: JOHNY_SECOND_X_ACCOUNT
    },
    {
      platform: 'github',
      username: 'test_neynar_githubaccount'
    }
  ],
  power_badge: false
};

describe('mergeAccountEntities', () => {
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
      //   await expect(
      //     getAccountEntityIdWithNeynarUserAndAddress({
      //       tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET,
      //       neynarUser: testNeynarUser
      //     })
      //   ).resolves.not.toThrow();
      expect(spyEndPoolConnection).toHaveBeenCalledTimes(1);
    });

    it('should be closed on error', async () => {
      //   await expect(
      //     getAccountEntityIdWithNeynarUserAndAddress({
      //       neynarUser: {} as unknown as NeynarUser,
      //       tokenCreatorAddress: null
      //     })
      //   ).rejects.toThrowError('Cannot read properties of undefined');
      expect(spyEndPoolConnection).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);
    });

    it('should combine account entities if different account entities exist for wallets already', async () => {
      // Create first account entity with wallet
      await dbModule.createAccountEntity(dbPool.db, {
        newWallets: [{ address: JOHNY_PRIMARY_ETH_WALLET }]
      });

      // Create second account entity with another wallet
      await dbModule.createAccountEntity(dbPool.db, {
        newWallets: [{ address: JOHNY_SECONDARY_ETH_WALLET }]
      });

      await expect(
        getAccountEntityIdWithNeynarUserAndAddress({
          tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET,
          neynarUser: testNeynarUser
        })
      ).rejects.toThrow(TokenIndexerError);
    });

    it('should throw TokenIndexerError if different account entity exists for X accounts already', async () => {
      // Create first account entity with user's X account
      await dbModule.createAccountEntity(dbPool.db, {
        newXAccounts: [{ username: JOHNY_FIRST_X_ACCOUNT, xid: 'test-xid-1' }]
      });

      // Create second account entity with user's X account
      await dbModule.createAccountEntity(dbPool.db, {
        newXAccounts: [{ username: JOHNY_SECOND_X_ACCOUNT, xid: 'test-xid-2' }]
      });

      await expect(
        getAccountEntityIdWithNeynarUserAndAddress({
          tokenCreatorAddress: null,
          neynarUser: testNeynarUser
        })
      ).rejects.toThrow(TokenIndexerError);
    });

    it('should throw TokenIndexerError if different account entities exist for multiple entity types', async () => {
      // Create first account entity with wallet and X account
      await dbModule.createAccountEntity(dbPool.db, {
        newWallets: [{ address: JOHNY_SECONDARY_ETH_WALLET }],
        newXAccounts: [{ username: JOHNY_FIRST_X_ACCOUNT, xid: 'test-xid-1' }]
      });

      // Create second account entity with Farcaster account
      await dbModule.createAccountEntity(dbPool.db, {
        newFarcasterAccount: testNeynarUser
      });

      await expect(
        getAccountEntityIdWithNeynarUserAndAddress({
          tokenCreatorAddress: JOHNY_SECONDARY_ETH_WALLET,
          neynarUser: testNeynarUser
        })
      ).rejects.toThrow(TokenIndexerError);
    });
  });

  afterAll(async () => {
    await dbPool.endPoolConnection();
  });
});
