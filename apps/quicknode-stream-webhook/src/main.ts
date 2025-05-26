import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { parseAndValidateQuicknodeWebhookPayload } from './parse-and-validate-payload.js';
import { getTransactionsForBlockNumber } from '@wiretap/utils/server';
import { env } from '../env.js';

const PORT = Number(process.env.PORT) || 8080;
const app = new Hono();

app.post('/webhook', async (c) => {
  console.time('TOTAL');

  console.time('webhook-parse-and-validate');
  const parsedContext = await parseAndValidateQuicknodeWebhookPayload(c);
  console.timeEnd('webhook-parse-and-validate');

  if (!parsedContext.success) {
    return parsedContext.response;
  }

  const block = parsedContext.webhookPayload;

  if (!block) {
    return c.json({ error: 'No block found' }, 404);
  }

  try {
    console.time('fetch-blocks');
    // @todo - pass transactions to next function
    await getTransactionsForBlockNumber(block.number, env.RPC_TRANSPORT_URL);
    console.timeEnd('fetch-blocks');

    console.log('current time   |', new Date().toISOString());
    console.log('blockTime      |', new Date(block?.timestamp * 1000).toISOString());
  } catch (error) {
    console.error('Error fetching transactions for block:', error);
    return c.json(
      {
        error: 'Error fetching transactions for block',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }

  console.timeEnd('TOTAL');
  return c.json({ message: 'Webhook received', success: true });
});

// Default 404 for all other routes
app.notFound((c) => c.text('404 Not Found', 404));

console.log(`quicknode-stream-webhook server running on port ${PORT}`);
serve({
  fetch: app.fetch,
  port: PORT,
});
