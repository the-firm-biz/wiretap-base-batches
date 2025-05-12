import { UNISWAP_POOL_V3_ABI } from '@wiretap/config';
import { onLogs } from './on-logs.js';
import { onError } from './on-error.js';
import { websocketPublicClient } from './rpc-clients.js';
import { startPoolsWatcher } from './pools.js';
import { initPriceFeeds } from '@wiretap/utils/server';

export async function startTokenCreatedWatcher() {
  let unwatch: (() => void) | null = null;

  const startWatcher = () => {
    console.log('Listening for swap events...');

    unwatch = websocketPublicClient.watchContractEvent({
      abi: UNISWAP_POOL_V3_ABI,
      eventName: 'Swap',
      onError: (error) => onError({ error, startWatcher, unwatch }),
      onLogs: onLogs
    });
  };

  const unwatchPools = await startPoolsWatcher();
  const priceFeedUnwatch = await initPriceFeeds();

  // Start the Swap log watcher
  startWatcher();

  // Return cleanup function
  return () => {
    if (unwatch) unwatch();
    if (unwatchPools) unwatchPools();
    if (priceFeedUnwatch) priceFeedUnwatch();
  };
}
