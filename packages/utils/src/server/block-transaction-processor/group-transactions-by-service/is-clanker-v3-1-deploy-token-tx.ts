import { type OpStackTransaction } from 'viem/chains';
import { CLANKER_3_1_ABI } from '@wiretap/config';
import { decodeFunctionData } from 'viem';

/**
 * Checks if a transaction is a Clanker deployToken call
 */
export function isClankerV3_1DeployTokenTx(tx: OpStackTransaction): boolean {
  try {
    const decoded = decodeFunctionData({
      abi: CLANKER_3_1_ABI,
      data: tx.input
    });

    return decoded.functionName === 'deployToken';
  } catch {
    return false;
  }
}
