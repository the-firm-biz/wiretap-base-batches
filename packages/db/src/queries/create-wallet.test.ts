import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  wallets,
  type NewWallet
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { createWallet } from './create-wallet.js';

describe('createWallet', () => {
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
  });

  it('creates and returns Wallet', async () => {
    const response = await createWallet(db, newWallet);
    const dbWallets = await db.select().from(wallets);
    expect(dbWallets.length).toBe(1);
    expect(dbWallets[0]!).toStrictEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      verificationSourceId: null,
      ...newWallet
    });
    expect(response).toStrictEqual(dbWallets[0]);
  });
});
