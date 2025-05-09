import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  accountEntityTrackers,
  wireTapAccounts,
  type NewAccountEntityTracker
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { createAccountEntityTracker } from './create-account-entity-tracker.js';

describe('createAccountEntityTracker ', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let differentAccountsAccountEntityTracker: NewAccountEntityTracker;
  let sameAccountEntityTracker: NewAccountEntityTracker;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity1] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity 1'
      })
      .returning();
    const [testAccountEntity2] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity 2'
      })
      .returning();
    const [testWireTapAccountForEntity1] = await db
      .insert(wireTapAccounts)
      .values({
        accountEntityId: testAccountEntity1!.id
      })
      .returning();
    // different tracker & tracked accounts
    differentAccountsAccountEntityTracker = {
      trackerWireTapAccountId: testWireTapAccountForEntity1!.id,
      trackedAccountEntityId: testAccountEntity2!.id,
      maxSpend: 1000000000000000000,
      updatedAt: null
    };
    // same tracker & tracked accounts
    sameAccountEntityTracker = {
      trackerWireTapAccountId: testWireTapAccountForEntity1!.id,
      trackedAccountEntityId: testAccountEntity1!.id,
      maxSpend: 1000000000000000000,
      updatedAt: null
    };
  });

  it('creates and returns Account Entity Tracker', async () => {
    const response = await createAccountEntityTracker(
      db,
      differentAccountsAccountEntityTracker
    );
    const dbAccountEntityTrackers = await db
      .select()
      .from(accountEntityTrackers);
    expect(dbAccountEntityTrackers.length).toBe(1);
    expect(dbAccountEntityTrackers[0]!).toStrictEqual({
      createdAt: expect.any(Date),
      ...differentAccountsAccountEntityTracker
    });
    expect(response).toStrictEqual(dbAccountEntityTrackers[0]);
  });

  it('creates and returns Account Entity Tracker for the same WireTapAccount & AccountEntity', async () => {
    const response = await createAccountEntityTracker(
      db,
      sameAccountEntityTracker
    );
    const dbAccountEntityTrackers = await db
      .select()
      .from(accountEntityTrackers);
    expect(dbAccountEntityTrackers.length).toBe(1);
    expect(dbAccountEntityTrackers[0]!).toStrictEqual({
      createdAt: expect.any(Date),
      ...sameAccountEntityTracker
    });
    expect(response).toStrictEqual(dbAccountEntityTrackers[0]);
  });

  it('throws error if Account Entity Tracker already exists for WireTapAccount & AccountEntity', async () => {
    await createAccountEntityTracker(db, differentAccountsAccountEntityTracker);
    await expect(
      createAccountEntityTracker(db, differentAccountsAccountEntityTracker)
    ).rejects.toThrow(
      expect.objectContaining({
        code: '23505', // unique constraint violation
        constraint:
          'account_entity_trackers_tracker_wire_tap_account_id_tracked_acc'
      })
    );
  });
});
