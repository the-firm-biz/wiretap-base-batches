import { env } from '../../env.js';

export async function triggerTokenWithdrawalFromGliderPortfolio(
  portfolioId: string,
  tokenAddress: string,
  amount: number
): Promise<string> {
  const result = await fetch(
    `https://api.glider.fi/v1/portfolio/${portfolioId}/withdraw`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': env.GLIDER_API_KEY
      },
      body: JSON.stringify({
        strategyInstanceId: portfolioId,
        asserts: [
          {
            assetId: `${tokenAddress}:8453`,
            amount: amount.toString(),
            decimals: 18, // todo
          },
        ]
      })
    }
  );
  return await result.text();
}
