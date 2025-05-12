import type { Address } from 'viem';
import { getTargetsByTokenAddress, singletonDb } from '@wiretap/db';
import { env } from '../env.js';
import { executeBuy } from './execute-buy.js';

export async function buyTrigger(tokenAddress: Address) {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });
  const trackers = await getTargetsByTokenAddress(db, tokenAddress);

  for (const trigger of trackers) {
    try {
      await executeBuy(trigger);
    } catch (error) {
      console.error(`Failed to execute trade`, error);
    }
  }
}
