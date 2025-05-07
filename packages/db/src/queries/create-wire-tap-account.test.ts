import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  type NewWireTapAccount,
  wireTapAccounts
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { createWireTapAccount } from './create-wire-tap-account.js';

describe('createWireTapAccount', () => {
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
  });

  it('creates and returns WireTap Account', async () => {
    const response = await createWireTapAccount(db, newWireTapAccount);
    const dbWireTapAccounts = await db.select().from(wireTapAccounts);
    expect(dbWireTapAccounts.length).toBe(1);
    expect(dbWireTapAccounts[0]!).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      updatedAt: null,
      ...newWireTapAccount
    });
    expect(response).toStrictEqual(dbWireTapAccounts[0]);
  });

  it('returns existing WireTap Account if one exists with the same accountEntityId', async () => {
    // First create an account
    const firstResponse = await createWireTapAccount(db, newWireTapAccount);

    // Try to create another with the same accountEntityId
    const secondResponse = await createWireTapAccount(db, newWireTapAccount);

    // Check that only one account exists in the DB
    const dbWireTapAccounts = await db.select().from(wireTapAccounts);
    expect(dbWireTapAccounts.length).toBe(1);

    // Check that both responses are the same
    expect(secondResponse).toStrictEqual(firstResponse);
  });
});
