import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { currencies, type NewCurrency } from '../schema/currencies.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getCurrency } from './get-currency.js';

describe('getWallet', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let newCurrency1: NewCurrency;
  let newCurrency2: NewCurrency;
  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    newCurrency1 = {
      address: '0x0000000000000000000000000000000000000001',
      name: 'Test Currency 1',
      symbol: 'TC1',
      decimals: 18
    };
    newCurrency2 = {
      address: '0x0000000000000000000000000000000000000002',
      name: 'Test Currency 2',
      symbol: 'TC2',
      decimals: 6
    };
    await db.insert(currencies).values(newCurrency1);
    await db.insert(currencies).values(newCurrency2);
  });

  it('returns a Currency if it exists', async () => {
    const response = await getCurrency(
      db,
      newCurrency1.address as `0x${string}`
    );
    expect(response).toEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      ...newCurrency1
    });
  });

  it('returns undefined if Currency does not exist', async () => {
    const response = await getCurrency(
      db,
      '0x1234567890abcdef' as `0x${string}`
    );
    expect(response).toBeUndefined();
  });

  it('is case insensitive for the address', async () => {
    const lowerCaseAddress =
      newCurrency2.address.toLowerCase() as `0x${string}`;
    const response = await getCurrency(db, lowerCaseAddress);
    expect(response).toEqual({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      ...newCurrency2
    });
  });
});
