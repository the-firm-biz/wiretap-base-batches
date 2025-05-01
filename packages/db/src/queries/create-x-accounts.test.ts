import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  type NewXAccount,
  xAccounts
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { createXAccounts } from './create-x-accounts.js';

describe('createXAccounts', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newXAccount: NewXAccount;
  let newXAccount2: NewXAccount;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    newXAccount = {
      xid: 'x-test-xid',
      username: 'x-test-username',
      accountEntityId: testAccountEntity!.id
    };
    newXAccount2 = {
      xid: 'x-test-xid2',
      username: 'x-test-username2',
      accountEntityId: testAccountEntity!.id
    };
  });

  it('creates and returns X Accounts', async () => {
    const response = await createXAccounts(db, [newXAccount, newXAccount2]);
    const dbXAccounts = await db.select().from(xAccounts);
    expect(dbXAccounts.length).toBe(2);
    expect(dbXAccounts[0]!).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      ...newXAccount
    });
    expect(response).toStrictEqual(dbXAccounts);
  });
});
