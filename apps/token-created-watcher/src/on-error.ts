import { sendSlackSystemMessage } from '@wiretap/utils/server';
import { env } from './env.js';

interface OnErrorParams {
  error: Error;
  startWatcher: () => void;
  unwatch: (() => void) | null;
}

let retryCount = 0;
const MAX_RETRIES = 10;
const RETRY_DELAY = 1000; // 1 second

export function onError({ error, startWatcher, unwatch }: OnErrorParams) {
  console.error('onError: watchContractEvent::', error);

  if (!unwatch) {
    console.error('onError:: Unwatch function not found!');
    return;
  }
  // Clean up existing watcher
  unwatch();

  if (retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(
      `onError:: Attempting to reconnect... (Attempt ${retryCount}/${MAX_RETRIES})`
    );

    sendSlackSystemMessage({
      systemMessage: {
        type: 'reconnectAttempt',
        currentAttempt: retryCount,
        maxAttempts: MAX_RETRIES
      },
      flyAppName: process.env.FLY_APP_NAME,
      flyMachineId: process.env.FLY_MACHINE_ID,
      botToken: env.SLACK_INFRABOT_TOKEN,
      channelId: env.INFRA_NOTIFICATIONS_CHANNEL_ID
    });

    // Retry after delay
    setTimeout(() => {
      startWatcher();
    }, RETRY_DELAY * retryCount);
  } else {
    console.error(
      'onError:: Max retry attempts reached. Manual intervention required.'
    );

    sendSlackSystemMessage({
      systemMessage: {
        type: 'reconnectMaxAttempts',
        maxAttempts: MAX_RETRIES
      },
      flyAppName: process.env.FLY_APP_NAME,
      flyMachineId: process.env.FLY_MACHINE_ID,
      botToken: env.SLACK_INFRABOT_TOKEN,
      channelId: env.INFRA_NOTIFICATIONS_CHANNEL_ID
    });

    console.log('onError:: Shutting down event watcher...');
    process.exit(0);
  }
}

export function resetReconnectRetries() {
  retryCount = 0;
}
