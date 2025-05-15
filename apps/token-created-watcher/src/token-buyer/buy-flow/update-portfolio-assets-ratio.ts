import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction
} from '@wiretap/db';
import { updateGliderPortfolio } from '../glider-api/update-glider-portfolio.js';
import type { Address } from 'viem';
import { callWithBackOff } from '@wiretap/utils/server';

type UpdatePortfolioAssetsRatioParams = {
  rebalanceId: number;
  portfolioId: string;
  accountEntityAddress: Address;
  tokenPercentageBps: number;
  tokenAddress?: Address;
};

export async function updatePortfolioAssetsRatio(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  params: UpdatePortfolioAssetsRatioParams
): Promise<void> {
  const {
    rebalanceId,
    tokenPercentageBps,
    accountEntityAddress,
    portfolioId,
    tokenAddress
  } = params;
  const updateRawResponse = await callWithBackOff(
    () =>
      updateGliderPortfolio({
        accountEntityAddress,
        portfolioId: portfolioId,
        tokenAddress: tokenAddress,
        tokenPercentageBps
      }),
    undefined,
    {
      name: `updateGliderPortfolio for portfolio ${params}`
    }
  );

  const success = updateRawResponse && updateRawResponse.success;
  if (!success) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: 'UPDATE_FAILED',
      response: updateRawResponse
    });
    throw new Error('UPDATE_FAILED');
  }
  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    label: 'UPDATED',
    response: updateRawResponse
  });
}
