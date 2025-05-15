import {
  insertGliderPortfolioRebalanceLog,
  singletonDb,
  type TokenBuyerPortfolio
} from '@wiretap/db';
import { env } from '../../env.js';
import { monitorRebalance } from './monitor-rebalance.js';

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
    // await updatePortfolioInGlider(
    //   db,
    //   rebalanceId,
    //   tokenPercentageBps,
    //   tokenBuyerPortfolio
    // );

    // const gliderRebalanceId = await triggerPortfolioRebalance(db, rebalanceId, tokenBuyerPortfolio)
    const gliderRebalanceId =
      'ao04x0r6-queue-strategy-rebalance-2025-05-15T06:21:43Z';

    const gliderRebalanceResult = await monitorRebalance(
      db,
      rebalanceId,
      gliderRebalanceId,
      tokenBuyerPortfolio
    );
    console.log(gliderRebalanceResult)

    // 4. withdraw
    // const requestWithdrawResponse = await triggerTokenWithdrawalFromGliderPortfolio(
    //   portfolio.portfolioId, portfolio.address as Address, token.address as Address
    // );
    // if (!isSuccess(requestWithdrawResponse)) {
    //   // todo: FAILED_WITHDRAW_REQUEST with updateRawResponse
    //   return;
    // }
    // const workflowId = 'CHANGE_ME_2';
    // todo: PENDING with rebalanceId
    //
    //   // TODO: is there a way to see workflowId status
  } catch (error) {
    console.log(`Error during buy with glider flow ${JSON.stringify(error)}`);
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      action: 'ERROR'
    });
  } finally {
    // set portfolio back to 100% ETH
    // const resetFullEthPortfolio = await updateGladerPortfolio({
    //   accountEntityAddress: account.accountEntityAddress,
    //   portfolioId: portfolio.portfolioId
    // });
    // if (!isSuccess(resetFullEthPortfolio)) {
    //   // todo: FAILED_WITHDRAW_REQUEST with updateRawResponse
    // }
  }
}
