import { handleNotifySlack } from '@wiretap/utils/server';
import { TokenIndexerError } from '../errors.js';
import { env } from '../env.js';

const divider = '='.repeat(56);

const mentionGroup = '<!subteam^S089U6A8WKB>';

export const sendSlackIndexerError = (error: unknown) => {
  if (error instanceof TokenIndexerError) {
    sendSlackTokenIndexerError(error);
    return;
  }
  if (error instanceof Error) {
    sendSlackGenericIndexerError(error.message);
    return;
  }
  sendSlackGenericIndexerError(`Unknown error: ${error}`);
};

export const sendSlackTokenIndexerError = async (error: TokenIndexerError) => {
  console.log(`TokenIndexerError in ${error.source} - ${error.message}`);
  console.log(error.toLogString());
  if (!env.IS_SLACK_NOTIFICATION_ENABLED) {
    console.log('Slack notifications are disabled');
    return;
  }
  const message = `${divider}\n:exclamation: :exclamation: :exclamation: ${mentionGroup} *${error.message}* (source: \`${error.source}\`)`;
  const errorDetails = '```\n' + error.toLogString() + '\n```';
  const fullMessage = `${message}\n${errorDetails}`;

  await handleNotifySlack(fullMessage, {
    slackToken: env.SLACK_ESPIONAGEBOT_TOKEN,
    slackChannelId: env.WIRETAP_NOTIFICATIONS_CHANNEL_ID
  });
};

export const sendSlackGenericIndexerError = async (errorMessage: string) => {
  console.log(`Generic indexer error - ${errorMessage}`);
  if (!env.IS_SLACK_NOTIFICATION_ENABLED) {
    console.log('Slack notifications are disabled');
    return;
  }
  const message = `${divider}\n:exclamation: :exclamation: :exclamation: ${mentionGroup} *${errorMessage}*`;
  await handleNotifySlack(message, {
    slackToken: env.SLACK_ESPIONAGEBOT_TOKEN,
    slackChannelId: env.WIRETAP_NOTIFICATIONS_CHANNEL_ID
  });
};
