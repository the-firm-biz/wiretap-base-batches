import { sendSlackSystemMessage } from './notifications/send-slack-system-message.js';
import { startTokenCreatedWatcher } from './start-watcher.js';

sendSlackSystemMessage({
  type: 'startup'
});

const unwatchEvents = await startTokenCreatedWatcher();

const cleanup = async (signal: string): Promise<void> => {
  console.log('Shutting down event watcher...');
  try {
    unwatchEvents();
    await sendSlackSystemMessage({
      type: 'shutdown',
      signal
    });
  } catch (error) {
    console.error('Error during shutdown', error);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);