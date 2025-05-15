import { triggerGliderPortfolioRebalance } from '../glider-api/trigger-glider-portfolio-rebalance.js';
import {
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction
} from '@wiretap/db';
import { callWithBackOff } from '@wiretap/utils/server';

export async function triggerPortfolioRebalance(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  rebalanceId: number,
  portfolioId: string
): Promise<string> {
  const triggerRebalanceRawResponse = await callWithBackOff(
    () => triggerGliderPortfolioRebalance(portfolioId),
    undefined,
    {
      name: `triggerGliderPortfolioRebalance for portfolio ${portfolioId} ${rebalanceId}`
    }
  );
  const success =
    triggerRebalanceRawResponse && triggerRebalanceRawResponse.success;
  if (!success) {
    await insertGliderPortfolioRebalanceLog(db, {
      gliderPortfolioRebalancesId: rebalanceId,
      label: 'TRIGGER_FAILED',
      response: triggerRebalanceRawResponse
    });
    throw new Error('TRIGGER_FAILED');
  }
  const gliderRebalanceId = triggerRebalanceRawResponse.data.rebalanceId;
  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    label: 'TRIGGERED',
    response: triggerRebalanceRawResponse,
    gliderRebalanceId
  });

  return gliderRebalanceId;
}
