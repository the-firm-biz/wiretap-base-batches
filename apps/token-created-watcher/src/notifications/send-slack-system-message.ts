import { handleNotifySlack } from '@wiretap/utils/server';
import { env } from '../env.js';

type SlackStartupMessage = {
  type: 'startup';
};

type SlackShutdownMessage = {
  type: 'shutdown';
  signal: string;
};

const messageStartEmoji = {
  startup: ':rocket:',
  shutdown: ':octagonal_sign:'
};

const getMessageText = (
  systemMessage: SlackStartupMessage | SlackShutdownMessage
): string => {
  if (systemMessage.type === 'startup') {
    return 'TokenCreatedWatcher has been started';
  }
  if (systemMessage.type === 'shutdown') {
    return `TokenCreatedWatcher has been terminated (signal = ${systemMessage.signal})`;
  }
  return 'how did you get here?';
};

/** Send a slack alert about system status (e.g. startup, shutdown) */
export const sendSlackSystemMessage = async (
  systemMessage: SlackStartupMessage | SlackShutdownMessage
): Promise<void> => {
  const envName = process.env.ENV_NAME; // ENV_NAME is defined in fly.toml
  if (!envName) {
    console.log('Slack system notifications skipped (ENV_NAME is not set)');
    return;
  }
  const message = `${messageStartEmoji[systemMessage.type]} *${envName}* - ${getMessageText(systemMessage)}`;
  await handleNotifySlack(message, {
    slackToken: env.SLACK_INFRABOT_TOKEN,
    slackChannelId: env.INFRA_NOTIFICATIONS_CHANNEL_ID
  });
};
