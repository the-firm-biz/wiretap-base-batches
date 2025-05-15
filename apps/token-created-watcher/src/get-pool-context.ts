import type { Address } from 'viem';
import type { DeployTokenArgs } from './get-transaction-context.js';
import { computePoolAddress, tickToPrice } from '@uniswap/v3-sdk';
import { ChainId, Token } from '@uniswap/sdk-core';
import {
  CLANKER_3_1_UNISWAP_FEE_BPS,
  UNISWAP_V3_ADDRESSES
} from '@wiretap/config';
import { fetchLatest } from '@wiretap/utils/server';

export interface PoolContext {
  address: Address;
  pairedAddress: Address;
  token0IsNewToken: boolean;
  priceEth: number;
  priceUsd: number;
}

export async function getPoolContext(
  tokenAddress: Address,
  args: DeployTokenArgs
): Promise<PoolContext> {
  const newToken = new Token(ChainId.BASE, tokenAddress, 18);
  const pairedToken = new Token(ChainId.BASE, args.poolConfig.pairedToken, 18);
  const token0IsNewToken = newToken.address < pairedToken.address;

  const uniswapPrice = tickToPrice(
    newToken,
    pairedToken,
    args.poolConfig.tickIfToken0IsNewToken
  );

  const ethUsdPrice = await fetchLatest('eth_usd');

  const priceEth = parseFloat(uniswapPrice.toSignificant(18));
  const priceUsd = priceEth * ethUsdPrice.formatted;

  const poolAddress = computePoolAddress({
    factoryAddress: UNISWAP_V3_ADDRESSES.FACTORY,
    tokenA: token0IsNewToken ? newToken : pairedToken,
    tokenB: token0IsNewToken ? pairedToken : newToken,
    fee: CLANKER_3_1_UNISWAP_FEE_BPS
  });

  return {
    address: poolAddress as Address,
    pairedAddress: args.poolConfig.pairedToken,
    token0IsNewToken,
    priceEth,
    priceUsd
  };
}
