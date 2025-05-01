import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  wallets,
  type NewWallet
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { createWallets } from './create-wallets.js';

describe('createWallets', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newWallet1: NewWallet;
  let newWallet2: NewWallet;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    newWallet1 = {
      address: '0x60C2c576310892d741ac6faFB74D82D3dd49F4B6',
      accountEntityId: testAccountEntity!.id
    };
    newWallet2 = {
      address: '0x70C2c576310892d741ac6faFB74D82D3dd49F4B7',
      accountEntityId: testAccountEntity!.id
    };
  });

  it('creates and returns Wallets', async () => {
    const response = await createWallets(db, [newWallet1, newWallet2]);
    const dbWallets = await db.select().from(wallets);
    expect(dbWallets.length).toBe(2);
    expect(dbWallets).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          verificationSourceId: null,
          ...newWallet1
        },
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          verificationSourceId: null,
          ...newWallet2
        }
      ])
    );
    expect(response).toStrictEqual(dbWallets);
  });
});
