import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  type AccountEntity
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { deleteAccountEntities } from './delete-account-entities.js';

let testEntity1: AccountEntity;
let testEntity2: AccountEntity;

describe('deleteAccountEntities', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const dbEntities = await db
      .insert(accountEntities)
      .values([
        {
          label: 'Test Entity 1'
        },
        {
          label: 'Test Entity 2'
        }
      ])
      .returning();
    testEntity1 = dbEntities[0]!;
    testEntity2 = dbEntities[1]!;
  });

  it('deletes all account entities', async () => {
    const response = await deleteAccountEntities(db, [
      testEntity1.id,
      testEntity2.id
    ]);
    const dbEntities = await db.select().from(accountEntities);
    expect(dbEntities.length).toBe(0);
    expect(response).toBe(true);
  });

  it('deletes only the account entities specified', async () => {
    const response = await deleteAccountEntities(db, [testEntity1.id]);
    const dbEntities = await db.select().from(accountEntities);
    expect(dbEntities.length).toBe(1);
    expect(dbEntities[0]!.id).toBe(testEntity2.id);
    expect(response).toBe(true);
  });

  it('deletes no account entities if none are specified', async () => {
    const response = await deleteAccountEntities(db, []);
    const dbEntities = await db.select().from(accountEntities);
    expect(dbEntities.length).toBe(2);
    expect(response).toBe(true);
  });
});
