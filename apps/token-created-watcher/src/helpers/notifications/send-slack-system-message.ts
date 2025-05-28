import { handleNotifySlack } from '@wiretap/utils/server';
import { env } from '../../env.js';

type SlackStartupMessage = {
  type: 'startup';
};

type SlackShutdownMessage = {
  type: 'shutdown';
  signal: string;
};

type SlackReconnectRetryMessage = {
  type: 'reconnectAttempt';
  currentAttempt: number;
  maxAttempts: number;
};

type SlackReconnectMaxAttemptsMessage = {
  type: 'reconnectMaxAttempts';
  maxAttempts: number;
};

const messageStartEmoji = {
  startup: ':rocket:',
  shutdown: ':octagonal_sign:',
  reconnectAttempt: ':broken_heart:',
  reconnectMaxAttempts: ':skull:'
};

const divider = '='.repeat(56);

const getMessageText = (
  systemMessage:
    | SlackStartupMessage
    | SlackShutdownMessage
    | SlackReconnectRetryMessage
    | SlackReconnectMaxAttemptsMessage
): string => {
  if (systemMessage.type === 'startup') {
    return 'TokenCreatedWatcher has been started';
  }
  if (systemMessage.type === 'shutdown') {
    return `TokenCreatedWatcher has been terminated (signal = ${systemMessage.signal})`;
  }
  if (systemMessage.type === 'reconnectAttempt') {
    return `TokenCreatedWatcher is attempting to reconnect (attempt ${systemMessage.currentAttempt} of ${systemMessage.maxAttempts})`;
  }
  if (systemMessage.type === 'reconnectMaxAttempts') {
    return `TokenCreatedWatcher has reached the maximum number of reconnect attempts (${systemMessage.maxAttempts}). Shutdown initiated. Manual intervention required.`;
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const _assureAllCasesAreHandled: never = systemMessage;
  return 'how did you get here?';
};

/** Send a slack alert about system status (e.g. startup, shutdown) */
export const sendSlackSystemMessage = async (
  systemMessage:
    | SlackStartupMessage
    | SlackShutdownMessage
    | SlackReconnectRetryMessage
    | SlackReconnectMaxAttemptsMessage
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
