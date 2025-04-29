import { getPoolDb, singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  farcasterAccounts,
  accountEntities,
  wallets,
  xAccounts,
  type NewFarcasterAccount,
  type NewWallet,
  type NewXAccount
} from '../schema/accounts/index.js';
import { clearDbTables } from '../utils/testUtils.js';
import { createAccountEntity } from './create-account-entity.js';

const newWallet: Omit<NewWallet, 'accountEntityId'> = {
  address: '0xd9aCd656A5f1B519C9E76a2A6092265A74186e58'
};

const newFarcasterAccount: Omit<NewFarcasterAccount, 'accountEntityId'> = {
  fid: 12345,
  username: 'farcaster-test-username'
};

const newXAccount: Omit<NewXAccount, 'accountEntityId'> = {
  xid: 'test-xid',
  username: 'x-test-username'
};

describe('createAccountEntity', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const { poolDb, endPoolConnection } = getPoolDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeEach(async () => {
    await clearDbTables(db);
  });

  afterAll(async () => {
    await endPoolConnection();
  });

  it.each([
    ['', '', ''],
    ['wallet', '', ''],
    ['wallet', ' farcasterAccount', ''],
    ['wallet', '', ' xAccount'],
    ['', 'farcasterAccount', ''],
    ['', 'farcasterAccount', ' xAccount'],
    ['', '', 'xAccount'],
    ['wallet', ' farcasterAccount', ' xAccount']
  ])(
    'creates and returns account entity - %s%s%s',
    async (hasWallet, hasFarcasterAccount, hasXAccount) => {
      const response = await createAccountEntity(poolDb, {
        newWallet: hasWallet ? newWallet : undefined,
        newFarcasterAccount: hasFarcasterAccount
          ? newFarcasterAccount
          : undefined,
        newXAccount: hasXAccount ? newXAccount : undefined,
        label: hasWallet ? 'Test Entity' : undefined
      });

      const dbEntities = await db.select().from(accountEntities);
      expect(dbEntities.length).toBe(1);
      expect(response.accountEntity).toStrictEqual(dbEntities[0]);

      if (hasWallet) {
        const dbWallets = await db.select().from(wallets);
        expect(dbWallets.length).toBe(1);
        expect(dbWallets[0]).toStrictEqual({
          id: expect.any(Number),
          address: newWallet.address,
          accountEntityId: dbEntities[0]!.id,
          createdAt: expect.any(Date),
          verificationSourceId: null
        });
        expect(response.wallet).toStrictEqual(dbWallets[0]);
      } else {
        const dbWallets = await db.select().from(wallets);
        expect(dbWallets.length).toBe(0);
        expect(response.wallet).toBeUndefined();
      }

      if (hasFarcasterAccount) {
        const dbFarcasterAccounts = await db.select().from(farcasterAccounts);
        expect(dbFarcasterAccounts.length).toBe(1);
        expect(dbFarcasterAccounts[0]).toStrictEqual({
          id: expect.any(Number),
          fid: newFarcasterAccount.fid,
          username: newFarcasterAccount.username,
          accountEntityId: dbEntities[0]!.id,
          createdAt: expect.any(Date)
        });
        expect(response.farcasterAccount).toStrictEqual(dbFarcasterAccounts[0]);
      } else {
        const dbFarcasterAccounts = await db.select().from(farcasterAccounts);
        expect(dbFarcasterAccounts.length).toBe(0);
        expect(response.farcasterAccount).toBeUndefined();
      }

      if (hasXAccount) {
        const dbXAccounts = await db.select().from(xAccounts);
        expect(dbXAccounts.length).toBe(1);
        expect(dbXAccounts[0]).toStrictEqual({
          id: expect.any(Number),
          xid: newXAccount.xid,
          username: newXAccount.username,
          accountEntityId: dbEntities[0]!.id,
          createdAt: expect.any(Date)
        });
        expect(response.xAccount).toStrictEqual(dbXAccounts[0]);
      } else {
        const dbXAccounts = await db.select().from(xAccounts);
        expect(dbXAccounts.length).toBe(0);
        expect(response.xAccount).toBeUndefined();
      }
    }
  );

  it('creates and returns account entity with specified label', async () => {
    const label = 'Test Entity';
    const response = await createAccountEntity(poolDb, {
      label: label
    });
    const dbEntities = await db.select().from(accountEntities);
    expect(dbEntities.length).toBe(1);
    expect(dbEntities[0]!.label).toBe(label);
    expect(response.accountEntity).toStrictEqual(dbEntities[0]);
  });
});
