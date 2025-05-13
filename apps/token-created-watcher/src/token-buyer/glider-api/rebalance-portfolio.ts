import { env } from '../../env.js';
import type { SuccessAware } from './types.js';

export async function rebalancePortfolio(
  portfolioId: string
): Promise<boolean> {
  const response = await fetch(
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
  console.log(`>>> ${await response.text()}`);
  // const rebalancePortfolioResponse = await response.json();
  // if (!(rebalancePortfolioResponse as SuccessAware).success) {
  //   console.warn(
  //     `Rebalance portfolio failed ${JSON.stringify(rebalancePortfolioResponse)}`
  //   );
  //   return false;
  // }
  // console.debug(
  //   `Rebalanced portfolio ${JSON.stringify(rebalancePortfolioResponse)}`
  // );
  return true;
}
