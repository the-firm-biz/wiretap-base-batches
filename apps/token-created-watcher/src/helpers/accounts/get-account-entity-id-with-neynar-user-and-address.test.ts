import type { Address } from 'viem';
import type { NeynarUser } from '@wiretap/utils/server';
import * as dbModule from '@wiretap/db';
import { env } from '../../env.js';
import { expect, describe, beforeEach, it, vi } from 'vitest';
import { getAccountEntityIdWithNeynarUserAndAddress } from './get-account-entity-id-with-neynar-user-and-address.js';

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

describe('getAccountEntityIdWithNeynarUserAndAddress', () => {
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
        getAccountEntityIdWithNeynarUserAndAddress({
          tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET,
          neynarUser: testNeynarUser
        })
      ).resolves.not.toThrow();
      expect(spyEndPoolConnection).toHaveBeenCalledTimes(1);
    });

    it('should be closed on error', async () => {
      await expect(
        getAccountEntityIdWithNeynarUserAndAddress({
          neynarUser: {} as unknown as NeynarUser,
          tokenCreatorAddress: null
        })
      ).rejects.toThrowError('Cannot read properties of undefined');
      expect(spyEndPoolConnection).toHaveBeenCalledTimes(1);
    });
  });

  describe('when no account entities exist', () => {
    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);
    });

    it('should create new account entity with all data', async () => {
      const accountEntityId = await getAccountEntityIdWithNeynarUserAndAddress({
        tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET,
        neynarUser: testNeynarUser
      });

      const accountEntityResult = await dbModule.getAccountEntity(
        db,
        accountEntityId
      );

      expect(accountEntityResult).toBeDefined();
      expect(accountEntityResult?.accountEntity.id).toBe(accountEntityId);

      // Get Farcaster account to check FID
      const farcasterAccount =
        await dbModule.getFarcasterAccountsByAccountEntityId(
          db,
          accountEntityId
        );
      expect(
        farcasterAccount?.find((f) => f.fid === testNeynarUser.fid)
      ).toBeDefined();

      // Check wallets were created
      const walletAddresses = accountEntityResult?.wallets.map(
        (w) => w.address
      );
      expect(walletAddresses).toContain(JOHNY_PRIMARY_ETH_WALLET);
      expect(walletAddresses).toContain(JOHNY_SECONDARY_ETH_WALLET);
      expect(walletAddresses).toContain(JOHNY_TERTIARY_ETH_WALLET);

      // Check X accounts were created
      const xUsernames = accountEntityResult?.xAccounts.map((x) => x.username);
      expect(xUsernames).toContain(JOHNY_FIRST_X_ACCOUNT);
      expect(xUsernames).toContain(JOHNY_SECOND_X_ACCOUNT);
    });
  });

  describe('when account entity exists', () => {
    let existingAccountEntityId: number;

    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);

      // Create existing account entity with wallet and X account
      const { accountEntity } = await dbModule.createAccountEntity(dbPool.db, {
        newWallets: [{ address: JOHNY_PRIMARY_ETH_WALLET }],
        newXAccounts: [{ username: JOHNY_FIRST_X_ACCOUNT, xid: 'test-xid' }],
        newFarcasterAccount: testNeynarUser
      });
      existingAccountEntityId = accountEntity.id;
    });

    it('should return existing account entity id when matching by wallet', async () => {
      const accountEntityId = await getAccountEntityIdWithNeynarUserAndAddress({
        tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET,
        neynarUser: testNeynarUser
      });

      expect(accountEntityId).toBe(existingAccountEntityId);
    });

    it('should return existing account entity id when exists for neynar user', async () => {
      const accountEntityId = await getAccountEntityIdWithNeynarUserAndAddress({
        tokenCreatorAddress: null,
        neynarUser: testNeynarUser
      });

      expect(accountEntityId).toBe(existingAccountEntityId);
    });

    it('should return existing account entity id when matching by X account', async () => {
      const accountEntityId = await getAccountEntityIdWithNeynarUserAndAddress({
        tokenCreatorAddress:
          '0x9999999999999999999999999999999999999999' as Address,
        neynarUser: {
          ...testNeynarUser,
          fid: 99999, // Different FID
          verified_addresses: {
            eth_addresses: [
              '0x9999999999999999999999999999999999999999' as Address
            ],
            sol_addresses: [],
            primary: {
              eth_address:
                '0x9999999999999999999999999999999999999999' as Address,
              sol_address: '0x0000000000000000000000000000000000000000'
            }
          }
        }
      });

      expect(accountEntityId).toBe(existingAccountEntityId);
    });
  });

  describe('multiple account entities', () => {
    beforeEach(async () => {
      await dbModule.unsafe__clearDbTables(db);
    });

    it('should merge account entities when multiple exist for the same user', async () => {
      // Create two separate account entities that belong to the same user
      const firstEntityResponse = await dbModule.createAccountEntity(
        dbPool.db,
        {
          newWallets: [{ address: JOHNY_PRIMARY_ETH_WALLET }]
        }
      );

      const secondEntityResponse = await dbModule.createAccountEntity(
        dbPool.db,
        {
          newXAccounts: [{ username: JOHNY_FIRST_X_ACCOUNT, xid: 'test-xid-1' }]
        }
      );

      const accountEntityId = await getAccountEntityIdWithNeynarUserAndAddress({
        tokenCreatorAddress: JOHNY_PRIMARY_ETH_WALLET,
        neynarUser: testNeynarUser
      });

      // Should return the primary (lowest) entity ID
      const expectedPrimaryId = Math.min(
        firstEntityResponse.accountEntity.id,
        secondEntityResponse.accountEntity.id
      );
      expect(accountEntityId).toBe(expectedPrimaryId);

      // Verify that merge occurred - secondary entity should not exist
      const secondaryId = Math.max(
        firstEntityResponse.accountEntity.id,
        secondEntityResponse.accountEntity.id
      );
      const secondaryEntity = await dbModule.getAccountEntity(
        dbPool.db,
        secondaryId
      );
      expect(secondaryEntity).toBeUndefined();
    });
  });

  afterAll(async () => {
    await dbPool.endPoolConnection();
  });
});
