import { clientEnv } from '@/clientEnv';
import { publicProcedure } from '../../trpc';

interface TokenPriceResponse {
  data: {
    symbol: string;
    prices: {
      currency: string;
      value: string;
      lastUpdatedAt: string;
    }[];
  }[];
}

export const getEthPriceUsd = publicProcedure.query(
  async (): Promise<number> => {
    const URL = `https://api.g.alchemy.com/prices/v1/${clientEnv.NEXT_PUBLIC_ALCHEMY_API_KEY}/tokens/by-symbol`;

    const response = await fetch(`${URL}?${['ETH']}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const parsedResponse = (await response.json()) as TokenPriceResponse;

    const ethPriceUsd = parsedResponse.data[0].prices.find(
      (price) => price.currency.toLowerCase() === 'usd'
    );

    return Number(ethPriceUsd?.value) || 0;
  }
);
