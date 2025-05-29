import { createHttpPublicClient } from '../../shared/viem/clients.js';
import type { Log } from 'viem';

/**
 * @param blockNumber - block number to get logs for
 * @param transportUrl - RPC transport URL
 * @returns logs for the block
 */
export async function getLogsForBlock(
  blockNumber: bigint,
  transportUrl: string
): Promise<Log[]> {
  const client = createHttpPublicClient({ transportUrl });

  const logs = await client.getLogs({
    fromBlock: blockNumber,
    toBlock: blockNumber
  });

  return logs;
}
