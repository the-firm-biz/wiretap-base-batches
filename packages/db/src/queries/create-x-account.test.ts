import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  type NewXAccount,
  xAccounts
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { createXAccount } from './create-x-account.js';

describe('createXAccount', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newXAccount: NewXAccount;

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
  });

  it('creates and returns X Account', async () => {
    const response = await createXAccount(db, newXAccount);
    const dbXAccounts = await db.select().from(xAccounts);
    expect(dbXAccounts.length).toBe(1);
    expect(dbXAccounts[0]!).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      ...newXAccount
    });
    expect(response).toStrictEqual(dbXAccounts[0]);
  });
});
