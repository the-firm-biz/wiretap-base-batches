import type { Address } from 'viem';
import type { DeployTokenArgs } from './get-transaction-context.js';
import { computePoolAddress } from '@uniswap/v3-sdk';
import { ChainId, Token } from '@uniswap/sdk-core';
import {
  CLANKER_3_1_UNISWAP_FEE_BPS,
  Q192,
  UNISWAP_POOL_V3_ABI,
  UNISWAP_V3_ADDRESSES
} from '@wiretap/config';
import { callWithBackOff, fetchLatest } from '@wiretap/utils/server';
import { httpPublicClient } from './rpc-clients.js';
import type { Context } from '@wiretap/utils/shared';

export interface PoolContext {
  address: Address;
  pairedAddress: Address;
  token0IsNewToken: boolean;
  priceEth: number;
  priceUsd: number;
}

export async function getPoolContext(
  tokenAddress: Address,
  args: DeployTokenArgs,
  { tracing: { parentSpan } = {} }: Context
): Promise<PoolContext> {
  const newToken = new Token(ChainId.BASE, tokenAddress, 18);
  const pairedToken = new Token(ChainId.BASE, args.poolConfig.pairedToken, 18);
  const token0IsNewToken = newToken.sortsBefore(pairedToken);

  const poolAddress = computePoolAddress({
    factoryAddress: UNISWAP_V3_ADDRESSES.FACTORY,
    tokenA: token0IsNewToken ? newToken : pairedToken,
    tokenB: token0IsNewToken ? pairedToken : newToken,
    fee: CLANKER_3_1_UNISWAP_FEE_BPS
  });

  const slot0 = await callWithBackOff(
    () =>
      httpPublicClient.readContract({
        address: poolAddress as `0x${string}`,
        abi: UNISWAP_POOL_V3_ABI,
        functionName: 'slot0'
      }),
    undefined,
    {
      name: 'getSlot0',
      tracing: { parentSpan }
    }
  );

  if (!slot0) {
    throw new Error(`Slot0 not found for pool ${poolAddress}`);
  }

  const tokenPriceEth = token0IsNewToken
    ? Number(slot0[0]) ** 2 / Number(Q192)
    : 1 / (Number(slot0[0]) ** 2 / Number(Q192));

  const ethUsdPrice = await fetchLatest('eth_usd');
  const priceUsd = tokenPriceEth * ethUsdPrice.formatted;

  return {
    address: poolAddress as Address,
    pairedAddress: args.poolConfig.pairedToken,
    priceEth: tokenPriceEth,
    token0IsNewToken,
    priceUsd
  };
}
