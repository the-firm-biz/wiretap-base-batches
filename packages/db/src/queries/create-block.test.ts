import { singletonDb } from '../client.js';
import { env } from '../env.js';
import { blocks } from '../schema/blocks.js';
import type { NewBlock } from '../schema/blocks.js';
import { unsafe__clearDbTables } from '../utils/testUtils.js';
import { createBlock } from './create-block.js';

describe('createBlock', () => {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  beforeEach(async () => {
    await unsafe__clearDbTables(db);
  });

  it('creates and returns a Block with timestamp', async () => {
    const newBlock: NewBlock = {
      number: 1234567890,
      timestamp: new Date()
    };
    const response = await createBlock(db, newBlock);
    const dbBlocks = await db.select().from(blocks);
    expect(dbBlocks.length).toBe(1);
    expect(dbBlocks[0]).toStrictEqual({
      createdAt: expect.any(Date),
      ...newBlock
    });
    expect(response).toStrictEqual(dbBlocks[0]);
  });

  it('creates and returns a Block without timestamp', async () => {
    const newBlock: NewBlock = {
      number: 1234567890,
      timestamp: null
    };
    const response = await createBlock(db, newBlock);
    const dbBlocks = await db.select().from(blocks);
    expect(dbBlocks.length).toBe(1);
    expect(dbBlocks[0]).toStrictEqual({
      createdAt: expect.any(Date),
      ...newBlock
    });
    expect(response).toStrictEqual(dbBlocks[0]);
  });

  it('updates existing block if it already exists', async () => {
    const newBlock: NewBlock = {
      number: 1234567890,
      timestamp: null
    };
    await createBlock(db, newBlock);
    const updatedBlock: NewBlock = {
      number: newBlock.number,
      timestamp: new Date()
    };
    const response = await createBlock(db, updatedBlock);
    const dbBlocks = await db.select().from(blocks);
    expect(dbBlocks.length).toBe(1);
    expect(dbBlocks[0]).toStrictEqual({
      createdAt: expect.any(Date),
      ...updatedBlock
    });
    expect(response).toStrictEqual(dbBlocks[0]);
  });

  it('returns undefined if the block exists and has a timestamp', async () => {
    const newBlock: NewBlock = {
      number: 1234567890,
      timestamp: new Date()
    };
    await createBlock(db, newBlock);
    const response = await createBlock(db, newBlock);
    expect(response).toBeUndefined();
  });
});
