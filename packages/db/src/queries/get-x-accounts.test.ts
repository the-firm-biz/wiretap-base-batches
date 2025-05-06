import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  xAccounts,
  type NewXAccount
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getXAccounts } from './get-x-accounts.js';

describe('getXAccounts', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newXAccount1: NewXAccount;
  let newXAccount2: NewXAccount;
  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    newXAccount1 = {
      xid: 'x-test-xid',
      username: 'x-test-username',
      accountEntityId: testAccountEntity!.id
    };
    newXAccount2 = {
      xid: 'x-test-xid-2',
      username: 'x-test-username-2',
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(xAccounts).values(newXAccount1);
    await db.insert(xAccounts).values(newXAccount2);
  });

  it('returns array of Wallets if exists', async () => {
    const xAccountsToGet = [newXAccount1.username, newXAccount2.username];
    const response = await getXAccounts(db, xAccountsToGet);
    expect(response.length).toBe(2);
    expect(response).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newXAccount1
        },
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newXAccount2
        }
      ])
    );
  });

  it('returns does not return Wallets that do not exist', async () => {
    const xAccountsToGet = [newXAccount1.username, 'x-test-username-not-in-db'];
    const response = await getXAccounts(db, xAccountsToGet);
    expect(response.length).toBe(1);
    expect(response).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newXAccount1
        }
      ])
    );
  });

  it('returns empty array if no wallets exist', async () => {
    const xAccountsToGet = ['x-test-username-not-in-db'];
    const response = await getXAccounts(db, xAccountsToGet);
    expect(response.length).toBe(0);
    expect(response).toStrictEqual([]);
  });
});
