import { WIRETAP_INTELLIGENCE_BRIEFING_CHANNEL_ID } from './constants.js';

interface HandleNotifySlackOptions {
  slackToken: string;
}

export async function handleNotifySlack(
  text: string,
  opts: HandleNotifySlackOptions
) {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.slackToken}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      channel: WIRETAP_INTELLIGENCE_BRIEFING_CHANNEL_ID,
      text,
      unfurl_links: false,
      unfurl_media: false
    })
  });
  return await response.json();
}
