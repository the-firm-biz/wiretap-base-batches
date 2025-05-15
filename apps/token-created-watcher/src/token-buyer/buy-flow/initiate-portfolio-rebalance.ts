import {
  createGliderPortfolioRebalance,
  type HttpDb, insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction,
  type TokenBuyerPortfolio
} from '@wiretap/db';
import { updateGliderPortfolio } from '../glider-api/update-glider-portfolio.js';
import type { Address } from 'viem';
import { isSuccess } from './utils.js';

export async function initiatePortfolioRebalance(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  balance: bigint,
  tokenPercentageBps: number,
  { account, portfolio, token }: TokenBuyerPortfolio
): Promise<number> {
  const rebalanceId = await createGliderPortfolioRebalance(db, {
    portfolioId: portfolio!.wireTapId,
    tokenId: token.id,
    portfolioEthBalanceWei: balance,
    tokenRatioBps: tokenPercentageBps
  });
  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    action: 'CREATED'
  });

  const updateRawResponse = await updateGliderPortfolio({
    accountEntityAddress: account.accountEntityAddress,
    portfolioId: portfolio!.portfolioId,
    tokenAddress: token.address as Address,
    tokenPercentageBps
  });

  if (!isSuccess(updateRawResponse)) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      action: 'FAILED',
      response: updateRawResponse
    });
    throw new Error(updateRawResponse);
  }
  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    action: 'UPDATED',
    response: updateRawResponse
  });
  return rebalanceId;
}