interface HandleNotifySlackOptions {
  slackToken: string;
  slackChannelId: string;
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
      channel: opts.slackChannelId,
      text,
      unfurl_links: false,
      unfurl_media: false
    })
  });
  return await response.json();
}
