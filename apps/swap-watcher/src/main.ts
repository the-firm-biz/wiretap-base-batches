import { sendSlackSystemMessage } from '@wiretap/utils/server';
import { startSwapWatcher } from './start-watcher.js';
import { env } from './env.js';

const unwatchEvents = await startSwapWatcher();

const cleanup = async (signal: string): Promise<void> => {
  console.log('Shutting down event watcher...');

  try {
    unwatchEvents();
    await sendSlackSystemMessage({
      systemMessage: {
        type: 'shutdown',
        signal
      },
      flyAppName: process.env.FLY_APP_NAME,
      flyMachineId: process.env.FLY_MACHINE_ID,
      botToken: env.SLACK_INFRABOT_TOKEN,
      channelId: env.INFRA_NOTIFICATIONS_CHANNEL_ID
    });
  } catch (error) {
    console.error('Error during shutdown', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
