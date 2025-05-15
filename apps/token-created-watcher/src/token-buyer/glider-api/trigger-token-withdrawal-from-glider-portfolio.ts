import { type Address, erc20Abi } from 'viem';
import { env } from '../../env.js';
import { httpPublicClient } from '../../rpc-clients.js';
import type {SuccessAware} from "./types.js";

export async function triggerTokenWithdrawalFromGliderPortfolio(
  portfolioId: string,
  portfolioAddress: Address,
  tokenAddress: Address
): Promise<SuccessAware> {
  const tokenBalance = await httpPublicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [portfolioAddress]
  });

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
        assets: [
          {
            assetId: `${tokenAddress}:8453`,
            amount: tokenBalance.toString(),
            decimals: 18
          }
        ]
      })
    }
  );
  return await result.json() as SuccessAware;
}
