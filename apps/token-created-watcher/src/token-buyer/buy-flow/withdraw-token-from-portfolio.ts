import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction
} from '@wiretap/db';
import { triggerTokenWithdrawalFromGliderPortfolio } from '../glider-api/trigger-token-withdrawal-from-glider-portfolio.js';
import type { Address } from 'viem';
import { isSuccess } from './utils.js';

type WithdrawTokenFromPortfolio = {
  rebalanceId: number;
  portfolioId: string;
  portfolioAddress: Address;
  tokenAddress: Address;
};

export async function withdrawTokenFromPortfolio(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  {
    rebalanceId,
    portfolioId,
    portfolioAddress,
    tokenAddress
  }: WithdrawTokenFromPortfolio
) {
  const withdrawRequestResponse =
    await triggerTokenWithdrawalFromGliderPortfolio(
      portfolioId,
      portfolioAddress,
      tokenAddress
    );

  if (!isSuccess(withdrawRequestResponse)) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: 'WITHDRAW_REQUEST_FAILED',
      response: withdrawRequestResponse
    });
    throw new Error('WITHDRAW_REQUEST_FAILED');
  }

  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    label: 'WITHDRAW_REQUESTED',
    response: withdrawRequestResponse
  });
  // TODO: is there a way to see get tx by workflowId from response
}
