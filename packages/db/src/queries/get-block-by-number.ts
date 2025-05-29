import { eq } from 'drizzle-orm';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { blocks, type Block } from '../schema/blocks.js';

export async function getBlockByNumber(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  blockNumber: number
): Promise<Block | null> {
  const [existingBlock] = await db
    .select()
    .from(blocks)
    .where(eq(blocks.number, blockNumber));

  if (!existingBlock) {
    return null;
  }

  return existingBlock;
}
