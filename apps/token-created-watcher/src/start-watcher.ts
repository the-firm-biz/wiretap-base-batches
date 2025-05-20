import { CLANKER_3_1_ADDRESS, CLANKER_ABI } from '@wiretap/config';
import { onLogs } from './on-logs.js';
import { onError } from './on-error.js';
import { websocketPublicClient } from './rpc-clients.js';
import { initPriceFeeds } from '@wiretap/utils/server';
import type { WatchContractEventReturnType } from 'viem';

export async function startTokenCreatedWatcher() {
  let unwatch: WatchContractEventReturnType | null = null;

  const startWatcher = () => {
    console.log('Listening for token events...');

    unwatch = websocketPublicClient.watchContractEvent({
      address: CLANKER_3_1_ADDRESS,
      abi: CLANKER_ABI,
      eventName: 'TokenCreated',
      onError: (error) => onError({ error, startWatcher, unwatch }),
      onLogs: onLogs
    });
  };

  const priceFeedUnwatch = await initPriceFeeds();

  // Start the TokenCreated log watcher
  startWatcher();

  // Return cleanup function
  return () => {
    if (unwatch) unwatch();
    if (priceFeedUnwatch) priceFeedUnwatch();
  };
}
