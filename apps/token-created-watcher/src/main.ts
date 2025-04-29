import { startTokenCreatedWatcher } from './start-watcher.js';

const unwatchEvents = startTokenCreatedWatcher();

const cleanup = () => {
  unwatchEvents();
  console.log('Shutting down event watcher...');
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
