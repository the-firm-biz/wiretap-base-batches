import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  farcasterAccounts,
  type NewFarcasterAccount
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getFarcasterAccountsByAccountEntityId } from './get-farcaster-accounts-by-account-entity-id.js';

describe('getFarcasterAccountsByAccountEntityId', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newFarcasterAccount1: NewFarcasterAccount;
  let newFarcasterAccount2: NewFarcasterAccount;
  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    newFarcasterAccount1 = {
      username: 'farcaster-test-username',
      fid: 123,
      displayName: 'Farcaster Test Display Name',
      pfpUrl: 'https://example.com/pfp.png',
      followerCount: 1000,
      accountEntityId: testAccountEntity!.id
    };
    newFarcasterAccount2 = {
      username: 'farcaster-test-username-2',
      fid: 456,
      displayName: 'Farcaster Test Display Name 2',
      pfpUrl: 'https://example.com/pfp2.png',
      followerCount: 2000,
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(farcasterAccounts).values(newFarcasterAccount1);
    await db.insert(farcasterAccounts).values(newFarcasterAccount2);
  });

  it('returns array of FarcasterAccounts if they exist for account entity id', async () => {
    const response = await getFarcasterAccountsByAccountEntityId(
      db,
      newFarcasterAccount1.accountEntityId
    );
    expect(response.length).toBe(2);
    expect(response).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newFarcasterAccount1
        },
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newFarcasterAccount2
        }
      ])
    );
  });

  it('returns empty array if no farcaster accounts exist for account entity id', async () => {
    const response = await getFarcasterAccountsByAccountEntityId(db, 100000);
    expect(response.length).toBe(0);
    expect(response).toStrictEqual([]);
  });
});
