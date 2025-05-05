import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { accountEntities } from '../schema/accounts/index.js';
import { blocks } from '../schema/blocks.js';
import { contracts } from '../schema/contracts.js';
import { tokens, type NewToken, type Token } from '../schema/tokens.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { updateTokensAthPriceUsd } from './update-tokens-ath.js';

describe('updateTokensAthPriceUsd', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  let testTokens: Token[];

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [testAccountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    const [block] = await db
      .insert(blocks)
      .values({
        number: 111111,
        timestamp: new Date()
      })
      .returning();
    const [contract] = await db
      .insert(contracts)
      .values({
        address: '0x123'
      })
      .returning();
    const newTestTokens: NewToken[] = [
      {
        name: 'Test Token 1',
        symbol: 'TT1',
        address: '0x111',
        deploymentTransactionHash: '0x911',
        deploymentContractId: contract!.id,
        accountEntityId: testAccountEntity!.id,
        athPriceUsd: null,
        block: block!.number
      },
      {
        name: 'Test Token 2',
        symbol: 'TT2',
        address: '0x222',
        deploymentTransactionHash: '0x922',
        deploymentContractId: contract!.id,
        accountEntityId: testAccountEntity!.id,
        athPriceUsd: null,
        block: block!.number
      },
      {
        name: 'Test Token 3',
        symbol: 'TT3',
        address: '0x333',
        deploymentTransactionHash: '0x933',
        deploymentContractId: contract!.id,
        accountEntityId: testAccountEntity!.id,
        athPriceUsd: null,
        block: block!.number
      }
    ];
    testTokens = await db.insert(tokens).values(newTestTokens).returning();
  });

  it('updates the athPriceUsd and returns updated tokens', async () => {
    const lowPrice = '0.00000000001234567899';
    const highPrice = '100200300400500.00000000001234567899';
    const updatedTokens = await updateTokensAthPriceUsd(db, [
      {
        id: testTokens[0]!.id,
        athPriceUsd: lowPrice
      },
      {
        id: testTokens[2]!.id,
        athPriceUsd: highPrice
      }
    ]);
    expect(updatedTokens.length).toBe(2);
    expect(updatedTokens).toStrictEqual(
      expect.arrayContaining([
        {
          ...testTokens[0],
          athPriceUsd: lowPrice
        },
        {
          ...testTokens[2],
          athPriceUsd: highPrice
        }
      ])
    );
    const allTokens = await db.select().from(tokens);
    expect(allTokens).toStrictEqual(
      expect.arrayContaining([
        { ...testTokens[0], athPriceUsd: lowPrice },
        { ...testTokens[1], athPriceUsd: null },
        { ...testTokens[2], athPriceUsd: highPrice }
      ])
    );
  });
});
