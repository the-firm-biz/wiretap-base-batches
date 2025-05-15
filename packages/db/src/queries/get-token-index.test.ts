import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { tokens } from '../schema/tokens.js';
import { accountEntities } from '../schema/accounts/account-entities.js';
import { contracts } from '../schema/contracts.js';
import { blocks } from '../schema/blocks.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getTokenIndex } from './get-token-index.js';

describe('getTokenIndex', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const testTokenAddressA = '0x0000000000000000000000000000000000000002';
  const testTokenAddressB = '0x0000000000000000000000000000000000000003';
  const testTokenAddressC = '0x0000000000000000000000000000000000000004';

  beforeEach(async () => {
    await unsafe__clearDbTables(db);

    // Create required entities for the test setup
    const [testAccountEntity1] = await db
      .insert(accountEntities)
      .values({
        label: 'Creator 1'
      })
      .returning();

    const [testAccountEntity2] = await db
      .insert(accountEntities)
      .values({
        label: 'Creator 2'
      })
      .returning();

    const [testContract] = await db
      .insert(contracts)
      .values({
        address: '0x0000000000000000000000000000000000000001'
      })
      .returning();

    const [testBlock1] = await db
      .insert(blocks)
      .values({
        number: 12345678,
        timestamp: new Date('2023-01-01')
      })
      .returning();

    const [testBlock2] = await db
      .insert(blocks)
      .values({
        number: 12345679,
        timestamp: new Date('2023-01-02')
      })
      .returning();

    // Create multiple tokens for the same account entity to test ranking
    await db.insert(tokens).values({
      name: 'Test Token A',
      symbol: 'TESTA',
      address: testTokenAddressA,
      deploymentTransactionHash:
        '0x1234567890123456789012345678901234567890123456789012345678901234',
      deploymentContractId: testContract!.id,
      accountEntityId: testAccountEntity1!.id,
      totalSupply: 1000000000,
      block: testBlock1!.number
    });

    await db.insert(tokens).values({
      name: 'Test Token B',
      symbol: 'TESTB',
      address: testTokenAddressB,
      deploymentTransactionHash:
        '0x2345678901234567890123456789012345678901234567890123456789012345',
      deploymentContractId: testContract!.id,
      accountEntityId: testAccountEntity1!.id,
      totalSupply: 2000000000,
      block: testBlock2!.number
    });

    // Token from a different account entity
    await db.insert(tokens).values({
      name: 'Test Token C',
      symbol: 'TESTC',
      address: testTokenAddressC,
      deploymentTransactionHash:
        '0x3456789012345678901234567890123456789012345678901234567890123456',
      deploymentContractId: testContract!.id,
      accountEntityId: testAccountEntity2!.id,
      totalSupply: 3000000000,
      block: testBlock1!.number
    });
  });

  it('retrieves the index for the first token of an account entity', async () => {
    const index = await getTokenIndex(db, testTokenAddressA as `0x${string}`);
    expect(index).toBe(1);
  });

  it('retrieves the index for the second token of an account entity', async () => {
    const index = await getTokenIndex(db, testTokenAddressB as `0x${string}`);
    expect(index).toBe(2);
  });

  it('retrieves the index for a token from a different account entity', async () => {
    const index = await getTokenIndex(db, testTokenAddressC as `0x${string}`);
    expect(index).toBe(1);
  });

  it('handles case-insensitive token address', async () => {
    const upperCaseAddress = testTokenAddressA.toUpperCase() as `0x${string}`;
    const index = await getTokenIndex(db, upperCaseAddress);
    expect(index).toBe(1);
  });

  it('returns null when token does not exist', async () => {
    const nonExistentAddress =
      '0xabcdef1234567890123456789012345678901234' as `0x${string}`;
    const index = await getTokenIndex(db, nonExistentAddress);
    expect(index).toBeNull();
  });
});
