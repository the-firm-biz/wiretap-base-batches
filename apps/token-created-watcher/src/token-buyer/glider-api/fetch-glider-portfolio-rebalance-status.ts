import { env } from '../../env.js';
import type { SuccessAware } from './types.js';

// status will be one of: "running", "completed", "failed", "canceled", or "terminated"
export type GliderRebalanceStatus = SuccessAware & {
  data: {
    status: string;
    result: {
      result: {
        userOpResults: [{
          receipt: {
            receipt: {
              blockNumber: string;
              transactionHash: string;
            }
          }
        }]
      }
    }
  }
}

export async function fetchGliderPortfolioRebalanceStatus(portfolioId: string, rebalanceId: string): Promise<string> {
  const result = await fetch(
    `https://api.glider.fi/v1/portfolio/${portfolioId}/rebalance/status/${rebalanceId}`,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': env.GLIDER_API_KEY
      }
    }
  );
  return await result.text();
}
