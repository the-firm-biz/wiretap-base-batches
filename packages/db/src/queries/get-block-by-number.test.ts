import { singletonDb } from '../client.js';
import { blocks, type NewBlock } from '../schema/index.js';
import { env } from '../env.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { getBlockByNumber } from './get-block-by-number.js';

const newBlock: NewBlock = {
  number: 1234567890,
  timestamp: new Date()
};

describe('getBlockByNumber', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
    await db.insert(blocks).values(newBlock);
  });

  describe('if block exists in DB', () => {
    it('returns existing DB row', async () => {
      const returnedRow = await getBlockByNumber(db, newBlock.number);
      expect(returnedRow).toStrictEqual({
        ...newBlock,
        createdAt: expect.any(Date)
      });
    });
  });

  describe('if block does not exist in DB', () => {
    it('returns null', async () => {
      const returnedRow = await getBlockByNumber(db, 1000000000);
      expect(returnedRow).toBeNull();
    });
  });
});
