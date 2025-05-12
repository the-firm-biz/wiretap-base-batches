import { handleNotifySlack } from '@wiretap/utils/server';
import { TokenIndexerError } from '../errors.js';
import { env } from '../env.js';
import { bigIntReplacer } from '@wiretap/utils/shared';

const divider = '='.repeat(56);

const mentionGroup = '<!subteam^S089U6A8WKB>';

export async function sendSlackIndexerError(error: unknown) {
  try {
    await _sendSlackIndexerError(error);
  } catch (e) {
    console.error(
      `Failed to send Slack message with error ${JSON.stringify(error, bigIntReplacer)}`,
      e
    );
  }
}

const _sendSlackIndexerError = async (error: unknown) => {
  if (error instanceof TokenIndexerError) {
    await sendSlackTokenIndexerError(error);
    return;
  }
  await sendSlackGenericIndexerError(error);
};

export const sendSlackTokenIndexerError = async (error: TokenIndexerError) => {
  console.error(
    `TokenIndexerError in ${error.source} - ${error.message}: ${error.toLogString()};`
  );
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

export const sendSlackGenericIndexerError = async (error: unknown) => {
  const genericMessage = `Generic indexer error - ${JSON.stringify(error, bigIntReplacer)}`;
  console.error(genericMessage);
  if (!env.IS_SLACK_NOTIFICATION_ENABLED) {
    console.log('Slack notifications are disabled');
    return;
  }
  let message = `${divider}\n:exclamation: :exclamation: :exclamation: ${mentionGroup}\n`;
  if (error instanceof Error) {
    message = `${message}: *${error.message}*\n${error.stack}`;
  } else {
    message = `${message}: \n${genericMessage}`;
  }
  await handleNotifySlack(message, {
    slackToken: env.SLACK_ESPIONAGEBOT_TOKEN,
    slackChannelId: env.WIRETAP_NOTIFICATIONS_CHANNEL_ID
  });
};
