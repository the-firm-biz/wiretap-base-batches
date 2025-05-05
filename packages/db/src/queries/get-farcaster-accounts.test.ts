import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  farcasterAccounts,
  type NewFarcasterAccount
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getFarcasterAccounts } from './get-farcaster-accounts.js';

describe('getFarcasterAccounts', () => {
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
      accountEntityId: testAccountEntity!.id
    };
    newFarcasterAccount2 = {
      username: 'farcaster-test-username-2',
      fid: 456,
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(farcasterAccounts).values(newFarcasterAccount1);
    await db.insert(farcasterAccounts).values(newFarcasterAccount2);
  });

  it('returns array of Wallets if exists', async () => {
    const fidsToGet = [newFarcasterAccount1.fid, newFarcasterAccount2.fid];
    const response = await getFarcasterAccounts(db, fidsToGet);
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

  it('returns does not return FarcasterAccounts that do not exist', async () => {
    const fidsToGet = [newFarcasterAccount1.fid, 9999999];
    const response = await getFarcasterAccounts(db, fidsToGet);
    expect(response.length).toBe(1);
    expect(response).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          ...newFarcasterAccount1
        }
      ])
    );
  });

  it('returns empty array if no wallets exist', async () => {
    const fidsToGet = [9999999];
    const response = await getFarcasterAccounts(db, fidsToGet);
    expect(response.length).toBe(0);
    expect(response).toStrictEqual([]);
  });
});
