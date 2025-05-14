import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { pools } from '../schema/pools.js';
import { tokens } from '../schema/tokens.js';
import { currencies } from '../schema/currencies.js';
import { contracts } from '../schema/contracts.js';
import { accountEntities } from '../schema/accounts/account-entities.js';
import { blocks } from '../schema/blocks.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getPool } from './get-pool.js';

describe('getPool', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const testPoolAddress = '0x0000000000000000000000000000000000000004';
  const testTokenAddress = '0x0000000000000000000000000000000000000002';
  const testCurrencyAddress = '0x0000000000000000000000000000000000000003';

  beforeEach(async () => {
    await unsafe__clearDbTables(db);

    // Create required entities for the test setup
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();

    const [testContract] = await db
      .insert(contracts)
      .values({
        address: '0x0000000000000000000000000000000000000001'
      })
      .returning();

    const [testBlock] = await db
      .insert(blocks)
      .values({
        number: 12345678,
        timestamp: new Date()
      })
      .returning();

    // Create token and currency
    const [testToken] = await db
      .insert(tokens)
      .values({
        name: 'Test Token',
        symbol: 'TEST',
        address: testTokenAddress,
        deploymentTransactionHash:
          '0x1234567890123456789012345678901234567890123456789012345678901234',
        deploymentContractId: testContract!.id,
        accountEntityId: testAccountEntity!.id,
        totalSupply: 1000000000,
        block: testBlock!.number
      })
      .returning();

    const [testCurrency] = await db
      .insert(currencies)
      .values({
        name: 'Ethereum',
        symbol: 'ETH',
        address: testCurrencyAddress,
        decimals: 18
      })
      .returning();

    // Create a test pool
    await db
      .insert(pools)
      .values({
        address: testPoolAddress,
        tokenId: testToken!.id,
        currencyId: testCurrency!.id,
        isPrimary: true,
        feeBps: 300,
        athMcapUsd: 1000000
      })
      .returning();
  });

  it('retrieves an existing pool by address', async () => {
    const pool = await getPool(db, testPoolAddress as `0x${string}`);

    expect(pool).toBeDefined();
    expect(pool!.pools.address).toBe(testPoolAddress);
  });

  it('handles case-insensitive pool address', async () => {
    const upperCaseAddress = testPoolAddress.toUpperCase() as `0x${string}`;
    const pool = await getPool(db, upperCaseAddress);

    expect(pool).toBeDefined();
    expect(pool!.pools.address).toBe(testPoolAddress);
  });

  it('retrieves pool tokens', async () => {
    const pool = await getPool(db, testPoolAddress as `0x${string}`);

    expect(pool).toBeDefined();
    expect(pool!.tokens.address).toBe(testTokenAddress);
    expect(pool!.currencies.address).toBe(testCurrencyAddress);
  });

  it('returns undefined when pool does not exist', async () => {
    const nonExistentAddress =
      '0xabcdef1234567890123456789012345678901234' as `0x${string}`;
    const pool = await getPool(db, nonExistentAddress);

    expect(pool).toBeUndefined();
  });
});
