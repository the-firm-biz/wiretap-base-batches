import { Context } from 'hono';
import { gunzipSync } from 'node:zlib';
import { Block } from 'viem';

/**
 * @note all block string values are hex encoded
 */
interface WebhookPayload {
  data: Block[];
}

interface ParsedAndValidatedResponse {
  success: boolean;
  webhookPayload: WebhookPayload;
  chainId: number;
}

/**
 * Parses and validates a Quicknode webhook payload
 * Handles gzipped requests, PING/PONG tests, and basic validation
 *
 * @param c The Hono context object
 * @returns An object containing the parsed webhook payload or error response
 */
export async function parseAndValidateQuicknodeWebhookPayload(
  c: Context,
): Promise<ParsedAndValidatedResponse> {
  const chainId = parseInt(c.req.param('Chain-Id'));
  const contentEncoding = c.req.header('Content-Encoding');

  let webhookPayload: WebhookPayload;

  // Handle gzipped content
  if (contentEncoding === 'gzip') {
    try {
      const buffer = await c.req.raw.arrayBuffer();
      const decompressedBuffer = await gunzipSync(buffer);
      const decompressedString = new TextDecoder().decode(decompressedBuffer);
      webhookPayload = JSON.parse(decompressedString);
    } catch (error) {
      console.error('Error decompressing or parsing data:', error);
      return {
        success: false,
        response: c.json(
          { error: 'Failed to decompress or parse request data' },
          400,
        ),
      };
    }
  } else {
    try {
      webhookPayload = await c.req.json();
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return {
        success: false,
        response: c.json({ error: 'Failed to parse request data' }, 400),
      };
    }
  }

  // Handle Quicknode PING/PONG test requests
  if ((webhookPayload as any)?.message === 'PING') {
    return {
      success: false,
      response: c.json(
        {
          success: true,
          message: 'PONG',
        },
        200,
      ),
    };
  }

  // Validate block number is present
  if (!webhookPayload.data.some((block: any) => block.number)) {
    return {
      success: false,
      response: c.json({ error: 'Missing block number' }, 400),
    };
  }

  // Return the parsed payload and metadata
  return {
    success: true,
    webhookPayload,
    chainId,
  };
}
