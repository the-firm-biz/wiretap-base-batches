import { PooledDbConnection, singletonDb } from '../client.js';
import { env } from '../env.js';
import { pools, type Pool } from '../schema/pools.js';
import { tokens } from '../schema/tokens.js';
import { currencies } from '../schema/currencies.js';
import { contracts } from '../schema/contracts.js';
import {
  accountEntities,
  type AccountEntity
} from '../schema/accounts/account-entities.js';
import { blocks } from '../schema/blocks.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { updatePoolAthMcap } from './update-pool-ath-mcap.js';
import { eq } from 'drizzle-orm';
import {
  farcasterAccounts,
  wallets,
  wireTapAccounts,
  xAccounts,
  type NewFarcasterAccount,
  type NewWallet,
  type NewWireTapAccount,
  type NewXAccount
} from '../schema/index.js';
import { updateAccountEntitiesToPrimaryEntityId } from './update-account-entities-to-primary-entity-id.js';

let newXAccount: NewXAccount;
let newXAccount2: NewXAccount;
let newWallet1: NewWallet;
let newWallet2: NewWallet;
let newWireTapAccount: NewWireTapAccount;
let newWireTapAccount2: NewWireTapAccount;
let newFarcasterAccount: NewFarcasterAccount;
let newFarcasterAccount2: NewFarcasterAccount;
let testAccountEntity: AccountEntity;
let testAccountEntity2: AccountEntity;
let testAccountEntity3: AccountEntity;

describe('updateAccountEntitiesToPrimaryEntityId', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const dbPool = new PooledDbConnection({ databaseUrl: env.DATABASE_URL });

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity, testAccountEntity2, testAccountEntity3] = await db
      .insert(accountEntities)
      .values([
        {
          label: 'Test Entity'
        },
        { label: 'Test Entity 2' },
        { label: 'Test Entity 3' }
      ])
      .returning();
    newXAccount = {
      xid: 'x-test-xid',
      username: 'x-test-username',
      accountEntityId: testAccountEntity!.id
    };
    newXAccount2 = {
      xid: 'x-test-xid2',
      username: 'x-test-username2',
      accountEntityId: testAccountEntity2!.id
    };
    newWallet1 = {
      address: '0x60C2c576310892d741ac6faFB74D82D3dd49F4B6',
      accountEntityId: testAccountEntity2!.id
    };
    newWallet2 = {
      address: '0x70C2c576310892d741ac6faFB74D82D3dd49F4B7',
      accountEntityId: testAccountEntity3!.id
    };
    newWireTapAccount = {
      accountEntityId: testAccountEntity!.id
    };
    newWireTapAccount2 = {
      accountEntityId: testAccountEntity3!.id
    };
    newFarcasterAccount = {
      fid: 12345,
      username: 'farcaster-test-username',
      displayName: 'Farcaster Test Display Name',
      pfpUrl: 'https://example.com/pfp.png',
      followerCount: 1000,
      accountEntityId: testAccountEntity!.id
    };
    newFarcasterAccount2 = {
      fid: 23456,
      username: 'farcaster-test-username2',
      displayName: 'Farcaster Test Display Name',
      pfpUrl: 'https://example.com/pfp.png',
      followerCount: 1000,
      accountEntityId: testAccountEntity2!.id
    };
    await db.batch([
      db.insert(xAccounts).values(newXAccount),
      db.insert(xAccounts).values(newXAccount2),
      db.insert(wallets).values(newWallet1),
      db.insert(wallets).values(newWallet2),
      db.insert(wireTapAccounts).values(newWireTapAccount),
      db.insert(wireTapAccounts).values(newWireTapAccount2),
      db.insert(farcasterAccounts).values(newFarcasterAccount),
      db.insert(farcasterAccounts).values(newFarcasterAccount2)
    ]);
  });

  afterAll(async () => {
    await dbPool.endPoolConnection();
  });

  it('updates account entities to primary entity id', async () => {});
});
