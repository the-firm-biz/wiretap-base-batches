import FormData from 'form-data';

export interface HandleNotifySlackOptions {
  slackToken: string;
  slackChannelId: string;
}

export interface SlackPostMessageResponse {
  ok: boolean;
  ts: string;
}

export interface SnippetParams {
  snippetContent: string;
  filename: string;
  filetype: string;
}

export async function handleNotifySlack(
  text: string,
  opts: HandleNotifySlackOptions
): Promise<SlackPostMessageResponse> {
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

  return (await response.json()) as SlackPostMessageResponse;
}

export async function postSnippet(
  {
    snippetContent,
    filename,
    filetype
  }: SnippetParams,
  opts: HandleNotifySlackOptions,
  threadTs: string | undefined
) {

  const form = new FormData();
  form.append('channels', opts.slackChannelId);
  form.append('content', snippetContent);
  form.append('filename', filename);
  form.append('filetype', filetype);
  // form.append('initial_comment', '💡 Here’s the code snippet as requested:');
  if (threadTs) {
    form.append('thread_ts', threadTs);
  }

  const response = await fetch('https://slack.com/api/files.upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.slackToken}`
    },
    body: form
  });
  console.log(await response.json())
  // return (await response.json()) as SlackPostMessageResponse;
}
