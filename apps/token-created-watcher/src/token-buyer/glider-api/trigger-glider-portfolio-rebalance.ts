import { env } from '../../env.js';
import type { SuccessAware } from './types.js';

export type TriggerGliderPortfolioRebalanceResponse = SuccessAware & {
  data: {
    rebalanceId: string;
  };
};

export async function triggerGliderPortfolioRebalance(
  portfolioId: string
): Promise<string> {
  const result = await fetch(
    `https://api.glider.fi/v1/portfolio/${portfolioId}/rebalance/schedule/trigger`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': env.GLIDER_API_KEY
      },
      body: JSON.stringify({
        skipScheduleValidation: true
      })
    }
  );
  return await result.text();
}
