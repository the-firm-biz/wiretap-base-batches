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

  if (retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(
      `onError:: Attempting to reconnect... (Attempt ${retryCount}/${MAX_RETRIES})`
    );

    // Clean up existing watcher
    if (unwatch) unwatch();

    // Retry after delay
    setTimeout(() => {
      startWatcher();
    }, RETRY_DELAY * retryCount);
  } else {
    console.error(
      'onError:: Max retry attempts reached. Manual intervention required.'
    );
    if (unwatch) unwatch();
    console.log('onError:: Shutting down event watcher...');
    process.exit(0);
  }
}
