import {
  insertGliderPortfolioRebalanceLog,
  singletonDb,
  type TokenBuyerPortfolio
} from '@wiretap/db';
import { env } from '../../env.js';
import { updatePortfolioAssetsRatio } from './update-portfolio-assets-ratio.js';
import { createPortfolioRebalance } from './create-portfolio-rebalance.js';
import { triggerPortfolioRebalance } from './trigger-portfolio-rebalance.js';
import { monitorRebalance } from './monitor-rebalance.js';
import { withdrawTokenFromPortfolio } from './withdraw-token-from-portfolio.js';
import type { Address } from 'viem';
import { ac } from 'vitest/dist/chunks/reporters.d.79o4mouw.js';
import { undefined } from 'zod';

export async function processBuyWithGlider(
  tokenPercentageBps: number,
  balance: bigint,
  tokenBuyerPortfolio: TokenBuyerPortfolio
): Promise<void> {
  const { portfolio, token, account } = tokenBuyerPortfolio;
  if (!portfolio) {
    return;
  }

  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const rebalanceId = await createPortfolioRebalance(db, {
    balance,
    tokenPercentageBps,
    portfolioId: portfolio.wireTapId,
    tokenId: token.id
  });

  try {
    await updatePortfolioAssetsRatio(db, {
      rebalanceId,
      tokenPercentageBps,
      tokenAddress: token.address as Address,
      portfolioId: portfolio.portfolioId,
      accountEntityAddress: account.accountEntityAddress as Address
    });
    const gliderRebalanceId = await triggerPortfolioRebalance(
      db,
      rebalanceId,
      portfolio.portfolioId
    );

    const gliderRebalanceResult = await monitorRebalance(
      db,
      rebalanceId,
      gliderRebalanceId,
      portfolio.portfolioId
    );
    console.log(gliderRebalanceResult);

    await withdrawTokenFromPortfolio(db, {
      rebalanceId,
      tokenAddress: token.address as Address,
      portfolioAddress: portfolio.address as Address,
      portfolioId: portfolio.portfolioId
    });
  } catch (error) {
    console.log(`Error during buy with glider flow ${JSON.stringify(error)}`);
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: 'ERROR'
    });
  } finally {
    try {
      // set portfolio back to 100% ETH
      await updatePortfolioAssetsRatio(db, {
        rebalanceId,
        tokenPercentageBps: 0,
        portfolioId: portfolio.portfolioId,
        accountEntityAddress: account.accountEntityAddress as Address
      });
      await insertGliderPortfolioRebalanceLog(db, {
        gliderPortfolioRebalancesId: rebalanceId,
        label: 'SET_FULL_ETH'
      });
    } catch (error) {
      console.log(`ERROR_SET_FULL_ETH ${error}`);
      await insertGliderPortfolioRebalanceLog(db, {
        gliderPortfolioRebalancesId: rebalanceId,
        label: 'ERROR_SET_FULL_ETH'
      });
    }
  }
}
