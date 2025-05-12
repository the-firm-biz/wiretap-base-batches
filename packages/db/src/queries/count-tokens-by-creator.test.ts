import { singletonDb } from '../client.js';
import { tokens } from '../schema/tokens.js';
import { accountEntities } from '../schema/accounts/index.js';
import { contracts } from '../schema/contracts.js';
import { env } from '../env.js';
import { countTokensByCreator } from './count-tokens-by-creator.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { blocks } from '../schema/blocks.js';

describe('countTokensByCreator', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const baseToken = {
    address: '0x60C2c576310892d741ac6faFB74D82D3dd49F4B6',
    deploymentTransactionHash:
      '0xc523028627ebdc8de1a37107ebafb45694f397929c978939f0d64c35b922a3b0',
    name: 'Test Token',
    symbol: 'TEST',
    score: 0.5,
    deploymentContractId: 1,
    accountEntityId: 1
  };

  let blockNumber: number;
  let contractId: number;
  let accountEntityId1: number;
  let accountEntityId2: number;

  beforeEach(async () => {
    await unsafe__clearDbTables(db);

    // Create a test contract
    const [contract] = await db
      .insert(contracts)
      .values({
        address: '0xd9aCd656A5f1B519C9E76a2A6092265A74186e58'
      })
      .returning();
    contractId = contract!.id;

    // Create two token creator entities
    const [tokenCreatorEntity1] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity 1'
      })
      .returning();
    accountEntityId1 = tokenCreatorEntity1!.id;

    const [tokenCreatorEntity2] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity 2'
      })
      .returning();
    accountEntityId2 = tokenCreatorEntity2!.id;

    // Create a test block
    const [testBlock] = await db
      .insert(blocks)
      .values({
        number: 1
      })
      .returning();
    blockNumber = testBlock!.number;
  });

  it('returns 0 when creator has no tokens', async () => {
    const count = await countTokensByCreator(db, accountEntityId1);
    expect(count).toBe(0);
  });

  it('returns correct count when creator has tokens', async () => {
    // Insert 3 tokens for creator 1
    await db.insert(tokens).values([
      {
        ...baseToken,
        address: '0x60C2c576310892d741ac6faFB74D82D3dd49F4B6',
        accountEntityId: accountEntityId1,
        deploymentContractId: contractId,
        block: blockNumber,
        totalSupply: 100_000_000_000
      },
      {
        ...baseToken,
        address: '0x70C2c576310892d741ac6faFB74D82D3dd49F4B7',
        accountEntityId: accountEntityId1,
        deploymentContractId: contractId,
        block: blockNumber,
        totalSupply: 100_000_000_000
      },
      {
        ...baseToken,
        address: '0x80C2c576310892d741ac6faFB74D82D3dd49F4B8',
        accountEntityId: accountEntityId1,
        deploymentContractId: contractId,
        block: blockNumber,
        totalSupply: 100_000_000_000
      }
    ]);

    // Insert 1 token for creator 2
    await db.insert(tokens).values({
      ...baseToken,
      address: '0x90C2c576310892d741ac6faFB74D82D3dd49F4B9',
      accountEntityId: accountEntityId2,
      deploymentContractId: contractId,
      block: blockNumber,
      totalSupply: 100_000_000_000
    });

    const count1 = await countTokensByCreator(db, accountEntityId1);
    expect(count1).toBe(3);

    const count2 = await countTokensByCreator(db, accountEntityId2);
    expect(count2).toBe(1);
  });

  it('handles non-existent token creator entity ID', async () => {
    const nonExistentId = 9999;
    const count = await countTokensByCreator(db, nonExistentId);
    expect(count).toBe(0);
  });
});
