import { singletonDb } from '../client.js';
import { env } from '../env.js';
import {
  accountEntities,
  wallets,
  type NewWallet
} from '../schema/accounts/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getWallets } from './get-wallets.js';

describe('getWallets', () => {
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
    await db.insert(wallets).values(newWallet1);
    await db.insert(wallets).values(newWallet2);
  });

  it('returns array of Wallets if exists', async () => {
    const walletsToGet = [
      newWallet1.address as `0x${string}`,
      newWallet2.address as `0x${string}`
    ];
    const response = await getWallets(db, walletsToGet);
    expect(response.length).toBe(2);
    expect(response).toStrictEqual(
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
  });

  it('returns does not return Wallets that do not exist', async () => {
    const walletsToGet = [
      newWallet1.address as `0x${string}`,
      '0x1234567' as `0x${string}`
    ];
    const response = await getWallets(db, walletsToGet);
    expect(response.length).toBe(1);
    expect(response).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          createdAt: expect.any(Date),
          verificationSourceId: null,
          ...newWallet1
        }
      ])
    );
  });

  it('returns empty array if no wallets exist', async () => {
    const walletsToGet = ['0x1234567' as `0x${string}`];
    const response = await getWallets(db, walletsToGet);
    expect(response.length).toBe(0);
    expect(response).toStrictEqual([]);
  });
});
