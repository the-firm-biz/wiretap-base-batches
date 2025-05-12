import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  farcasterAccounts,
  accountEntities,
  type NewFarcasterAccount,
  type NewWallet,
  type NewXAccount,
  wallets,
  xAccounts
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getAccountEntity } from './get-account-entity.js';
import { tokens, type NewToken } from '../schema/tokens.js';
import { contracts } from '../schema/contracts.js';
import { blocks } from '../schema/blocks.js';

describe('getAccountEntity', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const testAccountEntityLabel = 'Test Entity';
  let testAccountEntityId: number;
  let newFarcasterAccount: NewFarcasterAccount;
  let newWallet1: NewWallet;
  let newWallet2: NewWallet;
  let newXAccount: NewXAccount;
  let newToken: NewToken;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: testAccountEntityLabel
      })
      .returning();
    testAccountEntityId = testAccountEntity!.id;
    newFarcasterAccount = {
      fid: 12345,
      username: 'farcaster-test-username',
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(farcasterAccounts).values(newFarcasterAccount);
    newWallet1 = {
      address: '0x1111111111111111111111111111111111111111',
      verificationSourceId: null,
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(wallets).values(newWallet1);
    newWallet2 = {
      address: '0x2222222222222222222222222222222222222222',
      verificationSourceId: null,
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(wallets).values(newWallet2);
    newXAccount = {
      xid: 'xid-for-test-username',
      username: 'test-username',
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(xAccounts).values(newXAccount);
    const [contract] = await db
      .insert(contracts)
      .values({
        address: '0x3333333333333333333333333333333333333333'
      })
      .returning();
    const [block] = await db
      .insert(blocks)
      .values({
        number: 1234567890,
        timestamp: new Date()
      })
      .returning();
    newToken = {
      name: 'Test Token',
      symbol: 'TST',
      address: '0x3333333333333333333333333333333333333333',
      deploymentTransactionHash: '0x4444444444444444444444444444444444444444',
      deploymentContractId: contract!.id,
      accountEntityId: testAccountEntity!.id,
      score: null,
      block: block!.number,
      totalSupply: 100_000_000_000
    };
    await db.insert(tokens).values(newToken);
  });

  it('returns Account Entity with all related entities', async () => {
    const response = await getAccountEntity(db, testAccountEntityId);
    expect(response?.wallets.length).toBe(2);
    expect(response?.farcasterAccounts.length).toBe(1);
    expect(response?.xAccounts.length).toBe(1);
    expect(response?.tokens.length).toBe(1);
    expect(response).toStrictEqual({
      accountEntity: {
        createdAt: expect.any(Date),
        id: testAccountEntityId,
        label: testAccountEntityLabel
      },
      wallets: expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newWallet1
        },
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newWallet2
        }
      ]),
      farcasterAccounts: expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newFarcasterAccount
        }
      ]),
      xAccounts: expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newXAccount
        }
      ]),
      tokens: expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newToken
        }
      ])
    });
  });

  it('returns undefined if Account Entity does not exist', async () => {
    const response = await getAccountEntity(db, 99999);
    expect(response).toBeUndefined();
  });
});
