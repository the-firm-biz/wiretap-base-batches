import { UNISWAP_POOL_V3_ABI } from '@wiretap/config';
import { onLogs } from './on-logs.js';
import { onError } from './on-error.js';
import { websocketPublicClient } from './rpc-clients.js';
import { startPoolsWatcher } from './pools.js';
import { initPriceFeeds, sendSlackSystemMessage } from '@wiretap/utils/server';
import { type WatchContractEventReturnType } from 'viem';
import { env } from './env.js';

export async function startSwapWatcher() {
  let unwatch: WatchContractEventReturnType | null = null;

  const startWatcher = () => {
    console.log('Listening for swap events...');

    sendSlackSystemMessage({
      systemMessage: {
        type: 'startup'
      },
      flyAppName: process.env.FLY_APP_NAME,
      flyMachineId: process.env.FLY_MACHINE_ID,
      botToken: env.SLACK_INFRABOT_TOKEN,
      channelId: env.INFRA_NOTIFICATIONS_CHANNEL_ID
    });

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
