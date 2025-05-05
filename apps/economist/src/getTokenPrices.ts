import { gql, GraphQLClient } from 'graphql-request';
import { BigNumber } from 'bignumber.js';
import type { Token } from '@wiretap/db';
import { SUBGRAPHS, WETH_BASE_ADDRESS } from './constants.js';
import { isAddressEqual } from '@wiretap/utils/shared';

type TokenPrice = {
  token: Token;
  price: BigNumber;
};

// Insurance in case subgraph spits out null or undefined
const getPriceOrZero = (price: string | number | null | undefined) => {
  if (price === null || price === undefined) {
    return new BigNumber(0);
  }
  return new BigNumber(price);
};

export async function getTokenPrices(tokens: Token[]): Promise<TokenPrice[]> {
  const client = new GraphQLClient(SUBGRAPHS.UniV3Base.queryUrl);

  const poolsQuery = gql`
    query GetPools($tokenAddresses: [String!]) {
      bundles(where: { id: "1" }) {
        nativePriceUSD
      }
      pools(
        where: {
          token0_in: $tokenAddresses
          token1_in: $tokenAddresses
          feeTier: "10000"
        }
      ) {
        token1 {
          tokenAddress
        }
        token0 {
          tokenAddress
        }
        token0Price
        token1Price
      }
    }
  `;

  const tokenAddresses = tokens.map((token) => token.address);
  const variables = {
    tokenAddresses: [...tokenAddresses, WETH_BASE_ADDRESS]
  };
  const queryResult = await client.request<{
    bundles: {
      nativePriceUSD: string;
    }[];
    pools: {
      token0: { tokenAddress: string };
      token1: { tokenAddress: string };
      token0Price: string;
      token1Price: string;
    }[];
  }>(poolsQuery, variables);

  const ethPriceUsd = queryResult.bundles[0]?.nativePriceUSD;
  if (!ethPriceUsd) {
    throw new Error('No ETH price found');
  }

  console.log('SUBGRAPH DATA');
  console.log(`ETH price: $${ethPriceUsd}`);
  console.log(
    `Found ${queryResult.pools.length} pools for ${tokens.length} tokens`
  );

  const tokenPrices = tokens.reduce<TokenPrice[]>((acc, token) => {
    const pool = queryResult.pools.find(
      (pool) =>
        isAddressEqual(pool.token0.tokenAddress, token.address) ||
        isAddressEqual(pool.token1.tokenAddress, token.address)
    );
    if (!pool) {
      console.log(`No pool found for token ${token.address}`);
      return acc;
    }
    const price = getPriceOrZero(
      pool.token0.tokenAddress === token.address
        ? pool.token0Price
        : pool.token1Price
    );

    return [...acc, { token, price: price.multipliedBy(ethPriceUsd) }];
  }, []);

  console.log('TOKEN PRICES');
  console.log(JSON.stringify(tokenPrices, null, 2));

  return tokenPrices;
}
