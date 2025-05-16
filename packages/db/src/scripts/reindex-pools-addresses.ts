import {
  getCurrency,
  getDb,
  getOrCreatePool,
  pools,
  tokens
} from '@wiretap/db';
import { eq, isNull } from 'drizzle-orm';
import { computePoolAddress } from '@uniswap/v3-sdk';
import { ChainId, Token } from '@uniswap/sdk-core';
import { createHttpPublicClient } from '@wiretap/utils/shared';
import { fetchLatest, initPriceFeeds } from '@wiretap/utils/server';
import { config } from 'dotenv';
import {
  CLANKER_3_1_UNISWAP_FEE_BPS,
  CURRENCY_ADDRESSES,
  Q192,
  UNISWAP_POOL_V3_ABI,
  UNISWAP_V3_ADDRESSES
} from '@wiretap/config';
import { CLANKER_3_1_TOTAL_SUPPLY } from '@wiretap/config';

config({ path: '.env.local' });

const main = async () => {
  if (!process.env.SERVER_ALCHEMY_API_KEY || !process.env.DATABASE_URL) {
    throw new Error('SERVER_ALCHEMY_API_KEY and DATABASE_URL must be set');
  }

  const db = getDb({ databaseUrl: process.env.DATABASE_URL });
  const pairedAddress = CURRENCY_ADDRESSES.WETH;
  await initPriceFeeds();

  const currency = await getCurrency(db, pairedAddress as `0x${string}`);

  if (!currency) {
    throw new Error(`Currency not found for ${pairedAddress}`);
  }

  const tokensWithoutPool = await db
    .select({ id: tokens.id, tokenAddress: tokens.address })
    .from(tokens)
    .leftJoin(pools, eq(tokens.id, pools.tokenId))
    .where(isNull(pools.address));

  const pairToken = new Token(ChainId.BASE, pairedAddress, 18);

  const totalTokens = tokensWithoutPool.length;
  console.log(`Processing ${totalTokens} tokens without pool...`);

  for (const [i, token] of tokensWithoutPool.entries()) {
    const dbToken = new Token(ChainId.BASE, token.tokenAddress, 18);
    const token0IsDbToken = dbToken.address < pairToken.address;

    const poolAddress = computePoolAddress({
      factoryAddress: UNISWAP_V3_ADDRESSES.FACTORY,
      tokenA: token0IsDbToken ? dbToken : pairToken,
      tokenB: token0IsDbToken ? pairToken : dbToken,
      fee: CLANKER_3_1_UNISWAP_FEE_BPS
    });

    const client = createHttpPublicClient({
      alchemyApiKey: process.env.SERVER_ALCHEMY_API_KEY
    });

    const slot0 = await client
      .readContract({
        address: poolAddress as `0x${string}`,
        abi: UNISWAP_POOL_V3_ABI,
        functionName: 'slot0'
      })
      .catch((error) => {
        if (error.message.includes('returned no data ("0x")')) {
          console.warn(`Skipping non-WETH paired token ${token.tokenAddress}`);
          return null;
        }

        console.error(
          `Failed slot0 call for pool ${poolAddress} of token ${token.tokenAddress}.`
        );

        throw error;
      });

    if (!slot0) {
      continue;
    }

    const dbTokenIsToken0 = dbToken.sortsBefore(pairToken);
    const priceEth = dbTokenIsToken0
      ? Number(slot0[0]) ** 2 / Number(Q192)
      : 1 / (Number(slot0[0]) ** 2 / Number(Q192));

    const ethUsdPrice = await fetchLatest('eth_usd');
    const priceUsd = priceEth * ethUsdPrice.formatted;
    const mcapUsd = priceUsd * CLANKER_3_1_TOTAL_SUPPLY;

    await getOrCreatePool(db, {
      address: poolAddress,
      tokenId: token.id,
      currencyId: currency.id,
      feeBps: CLANKER_3_1_UNISWAP_FEE_BPS,
      athMcapUsd: mcapUsd,
      startingMcapUsd: mcapUsd,
      isPrimary: true
    });

    console.log(
      `${i + 1}/${totalTokens} - Created pool ${poolAddress} for ${token.tokenAddress}`
    );
  }
};

main();
