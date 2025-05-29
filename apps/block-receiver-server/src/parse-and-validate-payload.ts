import type { Context } from 'hono';

/**
 * @note webhook receives a single block, ran through a Quicknode Stream payload filter
 * to only return the block number and timestamp.
 *
 * Stream payload filter (declared in https://dashboard.quicknode.com/streams):
 * Extended from https://www.quicknode.com/docs/streams/filters#return-hash-and-block-number
 * ```ts
 * function main(stream) {
 *   const data = stream.data;
 *
 *   const numberDecimal = parseInt(data[0].number, 16);
 *   const unixTimestamp = parseInt(data[0].timestamp, 16);
 *
 *   return {
 *     timestamp: unixTimestamp,
 *     number: numberDecimal,
 *   };
 * }
 * ```
 */
interface WebhookPayload {
  /** unix timestamp */
  timestamp: number;
  /** block number */
  number: number;
}

type ParsedAndValidatedResponse =
  | {
      success: false;
      response: Response;
    }
  | {
      success: true;
      webhookPayload: WebhookPayload;
    };

/**
 * Parses and validates a Quicknode webhook payload
 * Handles gzipped requests, PING/PONG tests, and basic validation
 *
 * @param c The Hono context object
 * @returns An object containing the parsed webhook payload or error response
 */
export async function parseAndValidateQuicknodeWebhookPayload(
  c: Context
): Promise<ParsedAndValidatedResponse> {
  let webhookPayload: WebhookPayload;

  try {
    webhookPayload = await c.req.json();
  } catch (error) {
    console.error('Error parsing JSON data:', error);
    return {
      success: false,
      response: c.json({ error: 'Failed to parse request data' }, 400)
    };
  }

  // Handle Quicknode PING/PONG test requests
  if ((webhookPayload as any)?.message === 'PING') {
    return {
      success: false,
      response: c.json(
        {
          success: true,
          message: 'PONG'
        },
        200
      )
    };
  }

  // Validate block number is present
  if (!webhookPayload.number) {
    return {
      success: false,
      response: c.json({ error: 'Missing block number' }, 400)
    };
  }

  // Return the parsed payload and metadata
  return {
    success: true,
    webhookPayload
  };
}
