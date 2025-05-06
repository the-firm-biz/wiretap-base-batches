import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  type NewWireTapAccount,
  wireTapAccounts
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getWireTapAccount } from './get-wire-tap-account.js';

describe('getWireTapAccount', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newWireTapAccount: NewWireTapAccount;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    newWireTapAccount = {
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(wireTapAccounts).values(newWireTapAccount);
  });

  it('returns WireTap Account if exists', async () => {
    const response = await getWireTapAccount(
      db,
      newWireTapAccount.accountEntityId
    );
    expect(response).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      updatedAt: null,
      ...newWireTapAccount
    });
  });

  it('returns undefined if WireTap Account does not exist', async () => {
    const response = await getWireTapAccount(db, 99999);
    expect(response).toBeUndefined();
  });
});
