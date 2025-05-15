import {
  insertGliderPortfolioRebalanceLog,
  singletonDb,
  type TokenBuyerPortfolio
} from '@wiretap/db';
import { env } from '../../env.js';
import { updatePortfolio } from './update-portfolio.js';

export async function processBuyWithGlider(
  tokenPercentageBps: number,
  balance: bigint,
  tokenBuyerPortfolio: Required<TokenBuyerPortfolio>
) {
  if (!env.IS_GLIDER_ENABLED) {
    console.log('Glider is disabled');
    return;
  }

  const { portfolio, account, token } = tokenBuyerPortfolio;
  if (!portfolio) {
    return;
  }

  const db = singletonDb({
    databaseUrl: env.DATABASE_URL
  });

  const rebalanceId = 6;
  // const rebalanceId = await createPortfolioRebalance(
  //   db,
  //   balance,
  //   tokenPercentageBps,
  //   tokenBuyerPortfolio
  // );

  try {
    // await updatePortfolio(
    //   db,
    //   rebalanceId,
    //   tokenPercentageBps,
    //   tokenBuyerPortfolio
    // );
    // const gliderRebalanceId = await triggerPortfolioRebalance(db, rebalanceId, tokenBuyerPortfolio)
    // const gliderRebalanceResult = await monitorRebalance(
    //   db,
    //   rebalanceId,
    //   gliderRebalanceId,
    //   tokenBuyerPortfolio
    // );
    // console.log(gliderRebalanceResult)
    // await withdrawTokenFromPortfolio(db, rebalanceId, tokenBuyerPortfolio);
  } catch (error) {
    console.log(`Error during buy with glider flow ${JSON.stringify(error)}`);
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      action: 'ERROR'
    });
  } finally {
    try {
      // set portfolio back to 100% ETH
      await updatePortfolio(db, rebalanceId, 0, tokenBuyerPortfolio);
      await insertGliderPortfolioRebalanceLog(db, {
        gliderPortfolioRebalancesId: rebalanceId,
        action: 'SET_FULL_ETH',
      })
    } catch (error) {
      console.log(`ERROR_SET_FULL_ETH ${error}`);
      await insertGliderPortfolioRebalanceLog(db, {
        gliderPortfolioRebalancesId: rebalanceId,
        action: 'ERROR_SET_FULL_ETH'
      });
    }
  }
}
