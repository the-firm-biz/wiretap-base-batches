import { type OpStackTransaction } from 'viem/chains';
import { createHttpPublicClient } from '../../shared/viem/clients.js';

/**
 * @param blockNumber - block number to get transactions for
 * @param transportUrl - RPC transport URL
 * @returns transactions for the block
 */
export async function getTransactionsForBlock(
  blockNumber: bigint,
  transportUrl: string
): Promise<OpStackTransaction[]> {
  const client = createHttpPublicClient({ transportUrl });

  const { transactions } = await client.getBlock({
    blockNumber,
    includeTransactions: true
  });

  return transactions;
}
