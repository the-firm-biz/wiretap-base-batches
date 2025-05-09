import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  accountEntityTrackers,
  wireTapAccounts,
  type NewAccountEntityTracker
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getAccountEntityTrackersForWireTapAccount } from './get-account-entity-trackers-for-wiretap-account.js';

describe('getAccountEntityTrackersForWireTapAccount', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let accountEntityTracker1: NewAccountEntityTracker;
  let accountEntityTracker2: NewAccountEntityTracker;

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

    accountEntityTracker1 = {
      trackerWireTapAccountId: testWireTapAccountForEntity1!.id,
      trackedAccountEntityId: testAccountEntity2!.id,
      maxSpend: 1000000000000000000,
      updatedAt: null
    };
    accountEntityTracker2 = {
      trackerWireTapAccountId: testWireTapAccountForEntity1!.id,
      trackedAccountEntityId: testAccountEntity1!.id,
      maxSpend: 1000000000000000000,
      updatedAt: null
    };
    await db.insert(accountEntityTrackers).values(accountEntityTracker1);
    await db.insert(accountEntityTrackers).values(accountEntityTracker2);
  });

  it('returns Account Entity Trackers if they exist', async () => {
    const response = await getAccountEntityTrackersForWireTapAccount(
      db,
      accountEntityTracker1.trackerWireTapAccountId
    );
    expect(response).toStrictEqual([
      {
        createdAt: expect.any(Date),
        updatedAt: null,
        ...accountEntityTracker1
      },
      {
        createdAt: expect.any(Date),
        updatedAt: null,
        ...accountEntityTracker2
      }
    ]);
  });

  it('returns undefined if Account Entity Trackers for Wiretap Account do not exist', async () => {
    const response = await getAccountEntityTrackersForWireTapAccount(db, 99999);
    expect(response).toBeUndefined();
  });
});
