import { startSwapWatcher } from './start-watcher.js';

const unwatchEvents = await startSwapWatcher();

const cleanup = (): Promise<void> => {
  console.log('Shutting down event watcher...');
  try {
    unwatchEvents();
  } catch (error) {
    console.error('Error during shutdown', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
