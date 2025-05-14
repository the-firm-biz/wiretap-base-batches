import type { Address } from 'viem';
import { env } from '../../env.js';

export type UpdatePortfolioParams = {
  accountEntityAddress: string;
  portfolioId: string;
  tokenAddress?: Address;
  tokenPercentage?: number;
};

export async function updateGladerPortfolio({
  accountEntityAddress,
  portfolioId,
  tokenAddress,
  tokenPercentage
}: UpdatePortfolioParams): Promise<string> {
  const assets = [
    {
      blockType: 'asset',
      assetId: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    }
  ];
  const weightings = [100];

  if (tokenPercentage && tokenPercentage > 0) {
    assets.push({
      blockType: 'asset',
      assetId: tokenAddress!
    });
    weightings[0] = 100 - tokenPercentage;
    weightings.push(tokenPercentage);
  }

  const response = await fetch(
    `https://api.glider.fi/v1/portfolio/${portfolioId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': env.GLIDER_API_KEY
      },
      body: JSON.stringify({
        templateData: {
          name: `WireTap ${accountEntityAddress}`,
          entry: {
            blockType: 'weight',
            weightType: 'specified-percentage',
            weightings: weightings.map((w) => w.toString()),
            children: assets
          }
        }
      })
    }
  );
  return await response.text();
}
