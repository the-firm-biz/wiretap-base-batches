import type {
  HttpDb,
  ServerlessDb,
  ServerlessDbTransaction
} from '../client.js';
import { blocks, type NewBlock } from '../schema/blocks.js';
import { isNull } from 'drizzle-orm';

export async function createBlock(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  newBlock: NewBlock
) {
  await db
    .insert(blocks)
    .values(newBlock)
    .onConflictDoUpdate({
      target: blocks.number,
      set: { timestamp: newBlock.timestamp },
      setWhere: isNull(blocks.timestamp)
    });
}
