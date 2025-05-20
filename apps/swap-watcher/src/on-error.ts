interface OnErrorParams {
  error: Error;
  startWatcher: () => void;
  unwatch: (() => void) | null;
}

let retryCount = 0;
const MAX_RETRIES = 5;
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

    // Retry after delay
    setTimeout(() => {
      startWatcher();
    }, RETRY_DELAY * retryCount);
  } else {
    console.error(
      'onError:: Max retry attempts reached. Manual intervention required.'
    );
    console.log('onError:: Shutting down event watcher...');
    process.exit(0);
  }
}

export function resetReconnectRetries() {
  retryCount = 0;
}
