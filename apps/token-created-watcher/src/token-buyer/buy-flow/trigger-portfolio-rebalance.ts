import {
  triggerGliderPortfolioRebalance,
  type TriggerGliderPortfolioRebalanceResponse
} from '../glider-api/trigger-glider-portfolio-rebalance.js';
import { isSuccess } from './utils.js';
import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction,
  type TokenBuyerPortfolio
} from '@wiretap/db';

export async function triggerPortfolioRebalance(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  rebalanceId: number,
  { portfolio }: TokenBuyerPortfolio
): Promise<string> {
  const triggerRebalanceRawResponse = await triggerGliderPortfolioRebalance(
    portfolio!.portfolioId
  );
  if (!isSuccess(triggerRebalanceRawResponse)) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      action: 'TRIGGER_FAILED',
      response: triggerRebalanceRawResponse
    });
    throw new Error('TRIGGER_FAILED');
  }
  const gliderRebalanceId = (
    JSON.parse(
      triggerRebalanceRawResponse
    ) as TriggerGliderPortfolioRebalanceResponse
  ).data.rebalanceId;
  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    action: 'TRIGGERED',
    response: triggerRebalanceRawResponse,
    gliderRebalanceId
  });

  return gliderRebalanceId;
}
