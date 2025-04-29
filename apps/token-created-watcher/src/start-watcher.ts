import { createWebsocketPublicClient } from '@wiretap/utils/shared';
import { CLANKER_ABI, CLANKER_3_1_ADDRESS } from '@wiretap/config';
import { onLogs } from './on-logs.js';
import { onError } from './on-error.js';
import { env } from './env.js';

const websocketPublicClient = createWebsocketPublicClient({
  alchemyApiKey: env.ALCHEMY_API_KEY
});

export function startTokenCreatedWatcher() {
  let unwatch: (() => void) | null = null;

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

  // Start the TokenCreated log watcher
  startWatcher();

  // Return cleanup function
  return () => {
    if (unwatch) unwatch();
  };
}
