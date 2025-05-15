import {
  insertGliderPortfolioRebalanceLog,
  singletonDb,
  type TokenBuyerPortfolio
} from '@wiretap/db';
import { env } from '../../env.js';
import { initiatePortfolioRebalance } from './initiate-portfolio-rebalance.js';

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

  const rebalanceId = await initiatePortfolioRebalance(
    db,
    balance,
    tokenPercentageBps,
    tokenBuyerPortfolio
  );

  try {
    // 2. trigger rebalance
    // const rebalanceRawResponse = await triggerGliderPortfolioRebalance(
    //   portfolio.portfolioId
    // );
    // if (!isSuccess(rebalanceRawResponse)) {
    //   // todo: FAILED with updateRawResponse
    //   return;
    // }
    //   const rebalanceId = 'CHANGE_ME';
    //   // todo: PENDING with rebalanceId
    //
    //   // 3. pull status
    //   const rebalanceStatusResponse = await callWithBackOff(
    //     async () => {
    //       const statusResponse = await rebalanceStatus(portfolio.portfolioId, rebalanceId)
    //       const gliderRebalanceStatus = JSON.parse(statusResponse) as GliderRebalanceStatus;
    //       if (gliderRebalanceStatus.data.status === 'running') {
    //         throw new Error('still running')
    //       }
    //       return gliderRebalanceStatus;
    //     },
    //     {
    //       startingDelay: 400,
    //       timeMultiple: 1.3
    //     },
    //     {
    //       name: `rebalance status ${rebalanceId} portfolio ${portfolio.address}`
    //     }
    //   );
    //   if (!rebalanceStatusResponse || rebalanceStatusResponse.data.status !== 'completed') {
    //     // todo: FAILED
    //     return
    //   }
    //   // todo: mark REBALANCED
    //
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
