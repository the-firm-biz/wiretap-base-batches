import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { parseAndValidateQuicknodeWebhookPayload } from './parse-and-validate-payload.js';
import {
  getLogsForBlock,
  getTransactionsForBlock,
  groupTransactionLogPairsByService
} from '@wiretap/utils/server';
import { env } from '../env.js';

const PORT = Number(process.env.PORT) || 8080;
const app = new Hono();

app.post('/webhook', async (c) => {
  console.time('TOTAL');

  console.time('webhook-payload::  parse-and-validate');
  const parsedContext = await parseAndValidateQuicknodeWebhookPayload(c);
  console.timeEnd('webhook-payload::  parse-and-validate');

  if (!parsedContext.success) {
    return parsedContext.response;
  }

  const block = parsedContext.webhookPayload;

  if (!block) {
    return c.json({ error: 'No block found' }, 404);
  }

  try {
    /**
     * @note TRANSACTION & BLOCK FETCHING SHOULD BE PUSHED OUT OF THE WEBHOOK SERVER
     * https://linear.app/the-firm/issue/ENG-354/swaptoken-created-watcher-re-architect-our-watcher-services
     * This is just an implementation example
     */
    console.time('transactions:: get-for-block');
    const [transactions, logs] = await Promise.all([
      getTransactionsForBlock(BigInt(block.number), env.RPC_TRANSPORT_URL),
      getLogsForBlock(BigInt(block.number), env.RPC_TRANSPORT_URL)
    ]);
    console.timeEnd('transactions:: get-for-block');

    /**
     * @note TRANSACTION & LOG GROUPING SHOULD BE PUSHED OUT OF THE WEBHOOK SERVER
     * https://linear.app/the-firm/issue/ENG-354/swaptoken-created-watcher-re-architect-our-watcher-services
     * This is just an implementation example
     */
    console.time('transactions:: group-by-service');
    const transactionLogPairsByService = groupTransactionLogPairsByService(
      transactions,
      logs
    );
    console.timeEnd('transactions:: group-by-service');

    if (
      transactionLogPairsByService.clanker_v3_1_deploy_token_handler.length > 0
    ) {
      console.log(
        `Found ${transactionLogPairsByService.clanker_v3_1_deploy_token_handler.length} Clanker transactions in block ${block.number}`
      );
    }
    if (transactionLogPairsByService.uniswap_v3_swap_handler.length > 0) {
      console.log(
        `Found ${transactionLogPairsByService.uniswap_v3_swap_handler.length} Uniswap V3 transactions in block ${block.number}`
      );
    }

    console.log('current time   |', new Date().toISOString());
    console.log(
      'blockTime      |',
      new Date(block?.timestamp * 1000).toISOString()
    );
  } catch (error) {
    console.error('Error fetching transactions for block:', error);
    return c.json(
      {
        error: 'Error fetching transactions for block',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
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
  port: PORT
});
