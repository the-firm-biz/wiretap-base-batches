import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { accountEntities } from '../schema/accounts/account-entities.js';
import { blocks } from '../schema/blocks.js';
import { contracts } from '../schema/contracts.js';
import { currencies } from '../schema/currencies.js';
import { pools } from '../schema/pools.js';
import { tokens } from '../schema/tokens.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getAllPoolAddresses } from './get-all-pool-addresses.js';

describe('getAllPoolAddresses', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const testPools = [
    {
      address: '0x3333333333333333333333333333333333333333',
      tokenId: 1,
      currencyId: 1,
      feeBps: 300,
      athMcapUsd: 1000000001.25,
      startingMcapUsd: 1000000001.25,
      isPrimary: true
    },
    {
      address: '0x4444444444444444444444444444444444444444',
      tokenId: 1,
      currencyId: 1,
      feeBps: 10000,
      athMcapUsd: 10000.25,
      startingMcapUsd: 10000.25,
      isPrimary: true
    }
  ] as const;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    const [deploymentContract] = await db
      .insert(contracts)
      .values({
        address: '0x0000000000000000000000000000000000000000'
      })
      .returning();
    const [block] = await db
      .insert(blocks)
      .values({
        number: 1234567890,
        timestamp: new Date()
      })
      .returning();
    const [token1, token2] = await db
      .insert(tokens)
      .values([
        {
          block: block!.number,
          address: '0x0000000000000000000000000000000000000001',
          deploymentTransactionHash:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          name: 'Test Token',
          symbol: 'TEST',
          deploymentContractId: deploymentContract!.id,
          accountEntityId: testAccountEntity!.id,
          score: 0.999,
          totalSupply: 100_000_000_000
        },
        {
          block: block!.number,
          address: '0x0000000000000000000000000000000000000002',
          deploymentTransactionHash:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          name: 'Test Token',
          symbol: 'TEST',
          deploymentContractId: deploymentContract!.id,
          accountEntityId: testAccountEntity!.id,
          score: 0.999,
          totalSupply: 100_000_000_000
        }
      ])
      .returning();
    const [currency] = await db
      .insert(currencies)
      .values({
        address: '0x0000000000000000000000000000000000000000',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
      })
      .returning();

    await db.insert(pools).values([
      { ...testPools[0], tokenId: token1!.id, currencyId: currency!.id },
      { ...testPools[1], tokenId: token2!.id, currencyId: currency!.id }
    ]);
  });

  it('returns all pool addresses', async () => {
    const addresses = await getAllPoolAddresses(db);
    expect(addresses).toHaveLength(testPools.length);
    expect(addresses).toEqual(
      expect.arrayContaining(testPools.map((pool) => pool.address))
    );
  });

  it('returns empty array if no pools exist', async () => {
    await unsafe__clearDbTables(db);
    const addresses = await getAllPoolAddresses(db);
    expect(addresses).toEqual([]);
  });
});
