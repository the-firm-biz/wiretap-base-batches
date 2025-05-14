import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { pools, type Pool } from '../schema/pools.js';
import { tokens } from '../schema/tokens.js';
import { currencies } from '../schema/currencies.js';
import { contracts } from '../schema/contracts.js';
import { accountEntities } from '../schema/accounts/account-entities.js';
import { blocks } from '../schema/blocks.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { updatePoolAthMcap } from './update-pool-ath-mcap.js';
import { eq } from 'drizzle-orm';

describe('updatePoolAthMcap', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let testPool: Pool;
  const initialAthMcapUsd = 1000000;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
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
    const [testToken] = await db
      .insert(tokens)
      .values({
        name: 'Test Token',
        symbol: 'TEST',
        address: '0x0000000000000000000000000000000000000002',
        deploymentTransactionHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
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
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18
      })
      .returning();
    const [createdPool] = await db
      .insert(pools)
      .values({
        address: '0x0000000000000000000000000000000000000000',
        tokenId: testToken!.id,
        currencyId: testCurrency!.id,
        isPrimary: true,
        feeBps: 300,
        athMcapUsd: initialAthMcapUsd
      })
      .returning();

    testPool = createdPool!;
  });

  it('updates and returns pool when new athMcapUsd is lower', async () => {
    const lowerAthMcapUsd = 500000;
    const response = await updatePoolAthMcap(
      db,
      testPool.address,
      lowerAthMcapUsd
    );

    // Verify the pool was updated
    const [updatedPool] = await db
      .select()
      .from(pools)
      .where(eq(pools.id, testPool.id));

    expect(updatedPool!.athMcapUsd).toBe(lowerAthMcapUsd);
    expect(response).toStrictEqual(updatedPool);
  });

  it('does not update when new athMcapUsd is higher', async () => {
    const higherAthMcapUsd = 1500000;
    const response = await updatePoolAthMcap(
      db,
      testPool.address,
      higherAthMcapUsd
    );

    // Verify the pool was not updated
    const [unchangedPool] = await db
      .select()
      .from(pools)
      .where(eq(pools.id, testPool.id));

    expect(unchangedPool!.athMcapUsd).toBe(initialAthMcapUsd);
    expect(response).toBeUndefined();
  });

  it('does not update when new athMcapUsd is equal', async () => {
    const sameAthMcapUsd = initialAthMcapUsd;
    const response = await updatePoolAthMcap(
      db,
      testPool.address,
      sameAthMcapUsd
    );

    // Verify the pool was not updated
    const [unchangedPool] = await db
      .select()
      .from(pools)
      .where(eq(pools.id, testPool.id));

    expect(unchangedPool!.athMcapUsd).toBe(initialAthMcapUsd);
    expect(response).toBeUndefined();
  });
});
