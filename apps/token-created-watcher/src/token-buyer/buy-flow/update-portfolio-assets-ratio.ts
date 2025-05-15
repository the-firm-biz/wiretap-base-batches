import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction,
} from '@wiretap/db';
import { updateGliderPortfolio } from '../glider-api/update-glider-portfolio.js';
import type { Address } from 'viem';
import { isSuccess } from './utils.js';

type UpdatePortfolioAssetsRatioParams = {
  rebalanceId: number;
  portfolioId: string;
  accountEntityAddress: Address;
  tokenPercentageBps: number;
  tokenAddress?: Address
};

export async function updatePortfolioAssetsRatio(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  {
    rebalanceId,
    tokenPercentageBps,
    accountEntityAddress,
    portfolioId,
    tokenAddress
  }: UpdatePortfolioAssetsRatioParams,
): Promise<void> {
  const updateRawResponse = await updateGliderPortfolio({
    accountEntityAddress,
    portfolioId: portfolioId,
    tokenAddress: tokenAddress,
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
