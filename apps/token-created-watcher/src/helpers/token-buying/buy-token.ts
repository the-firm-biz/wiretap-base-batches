import type { Address } from 'viem';
import { loadTokenBuyerPortfolios, singletonDb } from '@wiretap/db';
import { env } from '../../env.js';
import { executeBuy } from './execute-buy.js';

export async function buyToken(tokenAddress: Address, poolAddress: Address) {
  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });
  const tokenBuyerPortfolios = await loadTokenBuyerPortfolios(db, tokenAddress);

  for (const buyerPortfolio of tokenBuyerPortfolios) {
    try {
      await executeBuy(buyerPortfolio, poolAddress);
    } catch (error) {
      console.error(`Failed to execute trade`, error);
    }
  }
}
