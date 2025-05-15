import {
  type HttpDb, insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction,
  type TokenBuyerPortfolio
} from '@wiretap/db';
import { updateGliderPortfolio } from '../glider-api/update-glider-portfolio.js';
import type { Address } from 'viem';
import { isSuccess } from './utils.js';

export async function updatePortfolioAssetsRatio(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  rebalanceId: number,
  tokenPercentageBps: number,
  { account, portfolio, token }: TokenBuyerPortfolio
): Promise<void> {

  const updateRawResponse = await updateGliderPortfolio({
    accountEntityAddress: account.accountEntityAddress,
    portfolioId: portfolio!.portfolioId,
    tokenAddress: token.address as Address,
    tokenPercentageBps
  });

  if (!isSuccess(updateRawResponse)) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: 'UPDATE_FAILED',
      response: updateRawResponse
    });
    throw new Error(updateRawResponse);
  }
  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    label: 'UPDATED',
    response: updateRawResponse
  });

}