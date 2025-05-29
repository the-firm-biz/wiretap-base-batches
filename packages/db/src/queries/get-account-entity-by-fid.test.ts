import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  farcasterAccounts,
  type NewFarcasterAccount
} from '../schema/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getAccountEntityByFid } from './get-account-entity-by-fid.js';

describe('getAccountEntityByFid', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const testAccountEntityLabel = 'Test Entity';
  let testAccountEntityId: number;
  let newFarcasterAccount: NewFarcasterAccount;

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
      displayName: 'Farcaster Test Display Name',
      pfpUrl: 'https://example.com/pfp.png',
      followerCount: 1000,
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(farcasterAccounts).values(newFarcasterAccount);
  });

  it('returns AccountEntity if it exists', async () => {
    const response = await getAccountEntityByFid(db, newFarcasterAccount.fid);
    expect(response).toStrictEqual({
      createdAt: expect.any(Date),
      id: testAccountEntityId,
      label: testAccountEntityLabel
    });
  });

  it('returns undefined if AccountEntity does not exist for fid', async () => {
    const response = await getAccountEntityByFid(db, 99999);
    expect(response).toBeUndefined();
  });
});
