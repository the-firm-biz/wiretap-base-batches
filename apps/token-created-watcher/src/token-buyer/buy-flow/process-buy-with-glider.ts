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

export async function processBuyWithGlider(
  tokenPercentageBps: number,
  balance: bigint,
  tokenBuyerPortfolio: Required<TokenBuyerPortfolio>
): Promise<void> {
  const { portfolio } = tokenBuyerPortfolio;
  if (!portfolio) {
    return;
  }

  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const rebalanceId = await createPortfolioRebalance(
    db,
    balance,
    tokenPercentageBps,
    tokenBuyerPortfolio
  );

  try {
    await updatePortfolioAssetsRatio(
      db,
      rebalanceId,
      tokenPercentageBps,
      tokenBuyerPortfolio
    );
    const gliderRebalanceId = await triggerPortfolioRebalance(
      db,
      rebalanceId,
      tokenBuyerPortfolio
    );

    const gliderRebalanceResult = await monitorRebalance(
      db,
      rebalanceId,
      gliderRebalanceId,
      tokenBuyerPortfolio
    );
    console.log(gliderRebalanceResult);

    await withdrawTokenFromPortfolio(db, rebalanceId, tokenBuyerPortfolio);
  } catch (error) {
    console.log(`Error during buy with glider flow ${JSON.stringify(error)}`);
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: 'ERROR'
    });
  } finally {
    try {
      // set portfolio back to 100% ETH
      await updatePortfolioAssetsRatio(db, rebalanceId, 0, tokenBuyerPortfolio);
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
