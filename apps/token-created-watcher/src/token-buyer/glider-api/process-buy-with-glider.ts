import type { TokenBuyerPortfolio } from '@wiretap/db';
import type { SuccessAware } from './types.js';
import { env } from '../../env.js';
import {updateGladerPortfolio} from "./update-glader-portfolio.js";
import type {Address} from "viem";
import {triggerGliderPortfolioRebalance} from "./trigger-glider-portfolio-rebalance.js";
import {triggerTokenWithdrawalFromGliderPortfolio} from "./trigger-token-withdrawal-from-glider-portfolio.js";

export async function processBuyWithGlider(
  tokenPercentage: number,
  balance: bigint,
  tokenBuyerPortfolio: TokenBuyerPortfolio
) {
  if (!env.IS_GLIDER_ENABLED) {
    console.log('Glider is disabled');
    return;
  }

  const { portfolio, account, token } = tokenBuyerPortfolio;
  if (!portfolio) {
    return;
  }
  // // 1. update portfolio
  // todo: insert rebalance and set CREATED
  // const updateRawResponse = await updateGladerPortfolio({
  //   accountEntityAddress: account.accountEntityAddress,
  //   portfolioId: portfolio!.portfolioId,
  //   tokenAddress: token.address as Address,
  //   tokenPercentage
  // });
  // if (!isSuccess(updateRawResponse)) {
  //   // todo: FAILED with updateRawResponse
  //   return;
  // }
  // todo: UPDATED

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

function isSuccess(rawResponse: string | undefined): boolean {
  console.log(`>>> ${rawResponse}\n\n`);
  if (!rawResponse) {
    return false;
  }
  try {
    const updatedPortfolioResponse = JSON.parse(rawResponse);
    return (updatedPortfolioResponse as SuccessAware)?.success ?? false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}
