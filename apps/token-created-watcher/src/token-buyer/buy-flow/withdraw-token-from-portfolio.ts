import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction
} from '@wiretap/db';
import { triggerTokenWithdrawalFromGliderPortfolio } from '../glider-api/trigger-token-withdrawal-from-glider-portfolio.js';
import type { Address } from 'viem';
import { RebalancesLogLabel } from '@wiretap/utils/server';

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

  if (!withdrawRequestResponse.success) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: RebalancesLogLabel.WITHDRAW_REQUEST_FAILED,
      response: withdrawRequestResponse
    });
    throw new Error(RebalancesLogLabel.WITHDRAW_REQUEST_FAILED.toString());
  }

  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    label: RebalancesLogLabel.WITHDRAW_REQUESTED,
    response: withdrawRequestResponse
  });
  // TODO: is there a way to see get tx by workflowId from response
}
