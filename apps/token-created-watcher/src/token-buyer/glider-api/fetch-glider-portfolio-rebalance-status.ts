import { env } from '../../env.js';

export async function fetchGliderPortfolioRebalanceStatus(portfolioId: string, rebalanceId: string): Promise<string> {
  const result = await fetch(
    `https://api.glider.fi/v1/portfolio/${portfolioId}/rebalance/status/${rebalanceId}`,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': env.GLIDER_API_KEY
      },
      body: JSON.stringify({
        skipScheduleValidation: true
      })
    }
  );
  // status will be one of: "running", "completed", "failed", "canceled", or "terminated"
  return await result.text();
}
