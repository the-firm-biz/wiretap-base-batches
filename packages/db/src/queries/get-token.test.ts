import { singletonDb } from '../client.js';
import {
  type NewToken,
  tokens,
  accountEntities,
  contracts,
  blocks,
  type Token
} from '../schema/index.js';
import { env } from '../env.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getToken } from './get-token.js';

const newToken: NewToken = {
  block: 0,
  address: '0x0000000000000000000000000000000000000000',
  deploymentTransactionHash:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  name: 'Test Token',
  symbol: 'TEST',
  deploymentContractId: 1,
  accountEntityId: 1,
  score: 0.999,
  totalSupply: 100_000_000_000,
  imageUrl: 'http://image.url',
  creatorTokenIndex: 1
};

let existingToken: Token;

describe('getToken', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    const [contract] = await db
      .insert(contracts)
      .values({
        address: '0x0000000000000000000000000000000000000000'
      })
      .returning();
    const [accountEntity] = await db
      .insert(accountEntities)
      .values({
        label: 'Test Entity'
      })
      .returning();
    const [block] = await db
      .insert(blocks)
      .values({
        number: 1234567890,
        timestamp: new Date()
      })
      .returning();
    newToken.deploymentContractId = contract!.id;
    newToken.accountEntityId = accountEntity!.id;
    newToken.block = block!.number;
  });

  describe('if token exists in DB', () => {
    beforeEach(async () => {
      [existingToken] = (await db
        .insert(tokens)
        .values(newToken)
        .returning()) as [Token];
    });

    it('returns existing DB row (exact same address)', async () => {
      const returnedRow = await getToken(db, newToken);
      expect(returnedRow).toStrictEqual(existingToken);
    });
    it('returns existing DB row (same address, different letter case)', async () => {
      const returnedRow = await getToken(db, {
        ...existingToken,
        address: existingToken.address.toLowerCase()
      });
      expect(returnedRow).toStrictEqual(existingToken);
    });
  });

  describe('if token does not exist in DB', () => {
    it('returns null', async () => {
      const returnedRow = await getToken(db, newToken);
      expect(returnedRow).toBeNull();
    });
  });
});
