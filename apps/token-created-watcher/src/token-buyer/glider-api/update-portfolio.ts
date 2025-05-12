import type { Address } from 'viem';
import { env } from '../../env.js';
import type { SuccessAware } from './types.js';

export type UpdatePortfolioParams = {
  accountEntityAddress: string;
  portfolioId: string;
  tokenAddress: Address;
  tokenPercentage: number;
};

export async function updatePortfolio({
  accountEntityAddress,
  portfolioId,
  tokenAddress,
  tokenPercentage
}: UpdatePortfolioParams): Promise<boolean> {
  if (tokenPercentage === 0) {
    console.log('Token percentage is 0');
    return false;
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
            weightings: [
              (100 - tokenPercentage).toString(),
              tokenPercentage.toString()
            ],
            children: [
              {
                blockType: 'asset',
                assetId: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
              },
              {
                blockType: 'asset',
                assetId: tokenAddress
              }
            ]
          }
        }
      })
    }
  );

  const updatedPortfolioResponse = await response.json();
  if (!(updatedPortfolioResponse as SuccessAware).success) {
    console.warn(
      `Update portfolio failed ${JSON.stringify(updatedPortfolioResponse)}`
    );
    return false;
  }
  console.debug(`Updated portfolio ${JSON.stringify(updatedPortfolioResponse)}`)
  return true;
}
