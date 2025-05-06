import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  wallets,
  type NewWallet
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getWallet } from './get-wallet.js';

describe('getWallet', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newWallet: NewWallet;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    newWallet = {
      address: '0x60C2c576310892d741ac6faFB74D82D3dd49F4B6',
      accountEntityId: testAccountEntity!.id
    };
    await db.insert(wallets).values(newWallet);
  });

  it('returns Wallet if exists', async () => {
    const response = await getWallet(db, newWallet.address as `0x${string}`);
    expect(response).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      verificationSourceId: null,
      ...newWallet
    });
  });

  it('returns undefined if Wallet does not exist', async () => {
    const response = await getWallet(db, '0x1234567');
    expect(response).toBeUndefined();
  });
});
