import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  farcasterAccounts,
  accountEntities,
  type NewFarcasterAccount
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getFarcasterAccount } from './get-farcaster-account.js';

describe('getFarcasterAccount', () => {
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
    await db.insert(farcasterAccounts).values(newFarcasterAccount);
  });

  it('returns Farcaster Account if exists', async () => {
    const response = await getFarcasterAccount(db, newFarcasterAccount.fid);
    expect(response).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      ...newFarcasterAccount
    });
  });

  it('returns undefined if Farcaster Account does not exist', async () => {
    const response = await getFarcasterAccount(db, 99999);
    expect(response).toBeUndefined();
  });
});
