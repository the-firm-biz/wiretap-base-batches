import { type WatchContractEventOnLogsParameter } from 'viem';
import { type UniswapPoolV3Abi } from '@wiretap/config';
import { resetReconnectRetries } from './on-error.js';
import type { SwapLog } from './types.js';
import { pools } from './pools.js';
import { ChainId, Token } from '@uniswap/sdk-core';
import { fetchLatest } from '@wiretap/utils/server';
import { tickToPrice } from '@uniswap/v3-sdk';
import { getDb, updatePoolAthMcap } from '@wiretap/db';
import { env } from './env.js';

export function onLogs(
  logs: WatchContractEventOnLogsParameter<UniswapPoolV3Abi, 'Swap', true>
) {
  resetReconnectRetries();
  // @todo parallelize in case multiple logs are returned
  logs.forEach(async (log: SwapLog) => {
    await onLog(log);
  });
}

export async function onLog(log: SwapLog) {
  if (!pools.has(log.address)) {
    return;
  }

  const db = getDb({ databaseUrl: env.DATABASE_URL });

  const newToken = new Token(ChainId.BASE, log.args.recipient, 18);
  const pairedToken = new Token(ChainId.BASE, log.args.sender, 18);

  const uniswapPrice = tickToPrice(newToken, pairedToken, log.args.tick);

  const tokenPriceEth = parseFloat(uniswapPrice.toSignificant(18));
  const ethUsdPrice = await fetchLatest('eth_usd');
  const tokenPriceUsd = tokenPriceEth * ethUsdPrice.formatted;

  const tokenPool = await updatePoolAthMcap(db, log.address, tokenPriceUsd);

  if (tokenPool) {
    console.log('New token pool ATH MCAP set', tokenPool.athMcapUsd);
  } else {
    console.debug('ATH mcap not updated for pool', log.address);
  }
}
