import { handleNotifySlack } from '@wiretap/utils/server';

const mentionGroup = '<!subteam^S089U6A8WKB>';

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

type SlackSystemMessage =
  | SlackStartupMessage
  | SlackShutdownMessage
  | SlackReconnectRetryMessage
  | SlackReconnectMaxAttemptsMessage;

const messageStartEmoji = {
  startup: ':rocket:',
  shutdown: ':octagonal_sign:',
  reconnectAttempt: ':broken_heart:',
  reconnectMaxAttempts: ':skull:'
};

const divider = '='.repeat(56);

const getMessageText = (systemMessage: SlackSystemMessage): string => {
  if (systemMessage.type === 'startup') {
    return 'TokenCreatedWatcher has been started';
  }
  if (systemMessage.type === 'shutdown') {
    return `TokenCreatedWatcher has been terminated (signal = ${systemMessage.signal})`;
  }
  if (systemMessage.type === 'reconnectAttempt') {
    const isLtTwoAttemptsRemaining =
      systemMessage.maxAttempts - systemMessage.currentAttempt <= 2;
    if (isLtTwoAttemptsRemaining) {
      return `TokenCreatedWatcher is attempting to reconnect (attempt ${systemMessage.currentAttempt} of ${systemMessage.maxAttempts}) ${mentionGroup}!`;
    }
    return `TokenCreatedWatcher is attempting to reconnect (attempt ${systemMessage.currentAttempt} of ${systemMessage.maxAttempts})`;
  }
  if (systemMessage.type === 'reconnectMaxAttempts') {
    return `TokenCreatedWatcher has reached the maximum number of reconnect attempts (${systemMessage.maxAttempts}). Shutdown initiated. Manual intervention required ${mentionGroup}.`;
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const _assureAllCasesAreHandled: never = systemMessage;
  return 'how did you get here?';
};

type SendSlackSystemMessageArgs = {
  systemMessage: SlackSystemMessage;
  flyAppName?: string;
  flyMachineId?: string;
  botToken: string;
  channelId: string;
};

/** Send a slack alert about system status (e.g. startup, shutdown) */
export const sendSlackSystemMessage = async ({
  systemMessage,
  flyAppName,
  flyMachineId,
  botToken,
  channelId
}: SendSlackSystemMessageArgs): Promise<void> => {
  if (!flyAppName) {
    console.log('Slack system notifications skipped (no FLY_APP_NAME env var)');
    return;
  }
  const flyData = `Fly app: ${flyAppName} | Fly machine: ${flyMachineId}`;
  const message = `${divider}\n${messageStartEmoji[systemMessage.type]} ${getMessageText(systemMessage)}\n${flyData}`;
  await handleNotifySlack(message, {
    slackToken: botToken,
    slackChannelId: channelId
  });
};
