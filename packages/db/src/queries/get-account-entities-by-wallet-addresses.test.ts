import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { accountEntities, wallets, type NewWallet } from '../schema/index.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getAccountEntitiesByWalletAddresses } from './get-account-entities-by-wallet-address.js';

describe('getAccountEntityByWalletAddress', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const testAccountEntityLabel = 'Test Entity';
  const testAccountEntityLabel2 = 'Test Entity 2';
  let testAccountEntityId: number;
  let testAccountEntityId2: number;
  let newWallet: NewWallet;
  let newWallet2: NewWallet;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity, testAccountEntity2] = await db
      .insert(accountEntities)
      .values([
        {
          label: testAccountEntityLabel
        },
        {
          label: testAccountEntityLabel2
        }
      ])
      .returning();
    testAccountEntityId = testAccountEntity!.id;
    testAccountEntityId2 = testAccountEntity2!.id;
    newWallet = {
      address: '0x1234567890123456789012345678901234567890',
      accountEntityId: testAccountEntityId
    };
    newWallet2 = {
      address: '0x2234567890123456789012345678901234567890',
      accountEntityId: testAccountEntityId2
    };
    await db.insert(wallets).values([newWallet, newWallet2]);
  });

  it('returns AccountEntity if it exists for one wallet address', async () => {
    const response = await getAccountEntitiesByWalletAddresses(db, [
      newWallet.address
    ]);
    expect(response).toStrictEqual([
      {
        createdAt: expect.any(Date),
        id: testAccountEntityId,
        label: testAccountEntityLabel
      }
    ]);
  });

  it('returns AccountEntity if it exists for two wallet addresses', async () => {
    const response = await getAccountEntitiesByWalletAddresses(db, [
      newWallet.address,
      newWallet2.address
    ]);
    expect(response).toStrictEqual([
      {
        createdAt: expect.any(Date),
        id: testAccountEntityId,
        label: testAccountEntityLabel
      },
      {
        createdAt: expect.any(Date),
        id: testAccountEntityId2,
        label: testAccountEntityLabel2
      }
    ]);
  });

  it('returns undefined if AccountEntity does not exist for any wallet addresses', async () => {
    const response = await getAccountEntitiesByWalletAddresses(db, [
      '0x3234567890123456789012345678901234567890'
    ]);
    expect(response).toBeUndefined();
  });
});
