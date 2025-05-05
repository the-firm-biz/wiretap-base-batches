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

const divider = '='.repeat(56);

const getMessageText = (
  systemMessage: SlackStartupMessage | SlackShutdownMessage
): string => {
  if (systemMessage.type === 'startup') {
    return 'TokenCreatedWatcher has been started';
  }
  if (systemMessage.type === 'shutdown') {
    return `TokenCreatedWatcher has been terminated (signal = ${systemMessage.signal})`;
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const _assureAllCasesAreHandled: never = systemMessage;
  return 'how did you get here?';
};

/** Send a slack alert about system status (e.g. startup, shutdown) */
export const sendSlackSystemMessage = async (
  systemMessage: SlackStartupMessage | SlackShutdownMessage
): Promise<void> => {
  const flyAppName = process.env.FLY_APP_NAME;
  if (!flyAppName) {
    console.log('Slack system notifications skipped (no FLY_APP_NAME env var)');
    return;
  }
  const flyData = `Fly app: ${flyAppName} | Fly machine: ${process.env.FLY_MACHINE_ID}`;
  const message = `${divider}\n${messageStartEmoji[systemMessage.type]} ${getMessageText(systemMessage)}\n${flyData}`;
  await handleNotifySlack(message, {
    slackToken: env.SLACK_INFRABOT_TOKEN,
    slackChannelId: env.INFRA_NOTIFICATIONS_CHANNEL_ID
  });
};
