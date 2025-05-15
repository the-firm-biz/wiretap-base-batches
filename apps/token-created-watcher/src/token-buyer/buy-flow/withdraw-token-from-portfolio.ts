import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction,
  type TokenBuyerPortfolio
} from '@wiretap/db';
import {
  triggerTokenWithdrawalFromGliderPortfolio
} from '../glider-api/trigger-token-withdrawal-from-glider-portfolio.js';
import type { Address } from 'viem';
import { isSuccess } from './utils.js';

export async function withdrawTokenFromPortfolio(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  rebalanceId: number,
  { portfolio, token }: TokenBuyerPortfolio
) {

  const withdrawRequestResponse = await triggerTokenWithdrawalFromGliderPortfolio(
    portfolio!.portfolioId, portfolio!.address as Address, token.address as Address
  );

  if (!isSuccess(withdrawRequestResponse)) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      action: 'WITHDRAW_REQUEST_FAILED',
      response: withdrawRequestResponse
    });
    throw new Error('WITHDRAW_REQUEST_FAILED')
  }

  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    action: 'WITHDRAW_REQUESTED',
    response: withdrawRequestResponse
  });
  // TODO: is there a way to see get tx by workflowId from response

}