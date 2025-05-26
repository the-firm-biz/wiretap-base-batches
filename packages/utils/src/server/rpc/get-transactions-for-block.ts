import { type OpStackTransaction } from 'viem/chains';
import { createQuicknodeHttpClient } from '../../shared/viem/clients.js';

export async function getTransactionsForBlockNumber(
  blockNumber: number,
  transportUrl: string
): Promise<OpStackTransaction[]> {
  const client = createQuicknodeHttpClient({ transportUrl });

  const { transactions } = await client.getBlock({
    blockNumber: BigInt(blockNumber),
    includeTransactions: true
  });

  return transactions;
}
