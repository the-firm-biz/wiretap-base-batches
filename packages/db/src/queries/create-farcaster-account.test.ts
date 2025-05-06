import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  farcasterAccounts,
  accountEntities,
  type NewFarcasterAccount
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { createFarcasterAccount } from './create-farcaster-account.js';

describe('createFarcasterAccount', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newFarcasterAccount: NewFarcasterAccount;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    newFarcasterAccount = {
      fid: 12345,
      username: 'farcaster-test-username',
      accountEntityId: testAccountEntity!.id
    };
  });

  it('creates and returns Farcaster Account', async () => {
    const response = await createFarcasterAccount(db, newFarcasterAccount);
    const dbFarcasterAccounts = await db.select().from(farcasterAccounts);
    expect(dbFarcasterAccounts.length).toBe(1);
    expect(dbFarcasterAccounts[0]!).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      ...newFarcasterAccount
    });
    expect(response).toStrictEqual(dbFarcasterAccounts[0]);
  });
});
