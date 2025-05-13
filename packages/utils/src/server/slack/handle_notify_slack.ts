import * as console from 'node:console';

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
  message?: string;
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
  { snippetContent, filename, filetype, message }: SnippetParams,
  opts: HandleNotifySlackOptions,
  threadTs: string | undefined
) {
  // 1. request file upload URL
  const params = new URLSearchParams();
  params.append('filename', filename);
  params.append('length', snippetContent.length.toString());
  params.append('snippet_type', filetype);

  const responseGetUploadUrl = await fetch(
    'https://slack.com/api/files.getUploadURLExternal',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opts.slackToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    }
  );

  const responseGetUploadUrlJson = await responseGetUploadUrl.json();

  const successResponse = responseGetUploadUrlJson as {
    ok: boolean;
    upload_url: string;
    file_id: string;
  };

  if (!successResponse.ok) {
    console.error(
      `failed to upload snippet ${JSON.stringify(responseGetUploadUrlJson)} `
    );
    return;
  }

  // 2. Upload file
  const uploadResponse = await fetch(successResponse.upload_url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.slackToken}`,
      'Content-Type': 'text/plain',
    },
    body: snippetContent,
  })
  if (!uploadResponse.ok) {
    console.error(`failed to push file ${JSON.stringify(uploadResponse)}`)
    return;
  }

  // 3. upload file to given URL
  const completeParams = new URLSearchParams();
  completeParams.append(
    'files',
    JSON.stringify([
      {
        id: successResponse.file_id
      }
    ])
  );
  completeParams.append('channels', opts.slackChannelId.toString());

  if (threadTs) {
    completeParams.append('thread_ts', threadTs);
  }
  if (message) {
    completeParams.append('initial_comment', message)
  }
  const completeUploadResponse = await fetch(
    'https://slack.com/api/files.completeUploadExternal',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opts.slackToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: completeParams
    }
  );
  if (!completeUploadResponse.ok) {
    console.error(`failed to complete upload ${JSON.stringify(completeUploadResponse)}`)
  }
}
