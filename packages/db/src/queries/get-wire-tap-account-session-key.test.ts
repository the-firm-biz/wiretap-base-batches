import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  wireTapAccounts,
  type NewWireTapAccount
} from '../schema/accounts/index.js';
import {
  wireTapSessionKeys,
  type NewWireTapSessionKey
} from '../schema/wire-tap-session-keys.js';
import { clearDbTables } from '../utils/testUtils.js';
import { getWireTapAccountSessionKey } from './get-wire-tap-account-session-key.js';

describe('getWireTapAccountSessionKey', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let wireTapAccountId: number;

  beforeEach(async () => {
    await clearDbTables(db);

    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();

    const newWireTapAccount: NewWireTapAccount = {
      accountEntityId: testAccountEntity!.id
    };

    const [createdWireTapAccount] = await db
      .insert(wireTapAccounts)
      .values(newWireTapAccount)
      .returning();

    wireTapAccountId = createdWireTapAccount!.id;
  });

  it('returns WireTap Account Session Key if it exists and is active', async () => {
    const newSessionKey: NewWireTapSessionKey = {
      wireTapAccountId,
      encryptedSessionKey: 'test-encrypted-session-key',
      isActive: true
    };

    await db.insert(wireTapSessionKeys).values(newSessionKey).returning();

    const response = await getWireTapAccountSessionKey(db, wireTapAccountId);

    expect(response).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      updatedAt: null,
      ...newSessionKey
    });
  });

  it('returns undefined if WireTap Account Session Key does not exist', async () => {
    const response = await getWireTapAccountSessionKey(db, 99999);
    expect(response).toBeUndefined();
  });

  it('returns undefined if WireTap Account Session Key exists but is not active', async () => {
    // Create inactive session key
    const newSessionKey: NewWireTapSessionKey = {
      wireTapAccountId,
      encryptedSessionKey: 'test-encrypted-session-key-inactive',
      isActive: false
    };

    await db.insert(wireTapSessionKeys).values(newSessionKey).returning();

    const response = await getWireTapAccountSessionKey(db, wireTapAccountId);
    expect(response).toBeUndefined();
  });
});
