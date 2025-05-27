import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { accountEntities, wallets, type NewWallet } from '../schema/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getAccountEntityByFid } from './get-account-entity-by-fid.js';
import { getAccountEntityByWalletAddress } from './get-account-entity-by-wallet-address.js';

describe('getAccountEntityByWalletAddress', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const testAccountEntityLabel = 'Test Entity';
  let testAccountEntityId: number;
  let newWallet: NewWallet;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: testAccountEntityLabel
      })
      .returning();
    testAccountEntityId = testAccountEntity!.id;
    newWallet = {
      address: '0x1234567890123456789012345678901234567890',
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(wallets).values(newWallet);
  });

  it('returns AccountEntity if it exists', async () => {
    const response = await getAccountEntityByWalletAddress(
      db,
      newWallet.address
    );
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
