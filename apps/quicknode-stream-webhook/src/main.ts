import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { parseAndValidateQuicknodeWebhookPayload } from './parse-and-validate-payload.js';

const PORT = process.env.PORT || 3000;
const app = new Hono();

app.post('/webhook', async (c) => {
  console.log('webhook called');

  const parsedContext = await parseAndValidateQuicknodeWebhookPayload(c);

  // const body = await c.req.text();

  // console.log('Received webhook. Request details:');
  // console.log(
  //   'Headers:',
  //   JSON.stringify(Object.fromEntries(c.req.raw.headers.entries()), null, 2),
  // );

  // try {
  //   const jsonData = JSON.parse(body);
  //   console.log('Parsed JSON data:');
  //   console.log(JSON.stringify(jsonData, null, 2));

  //   // Here you would process TokenCreated events from the data
  //   if (jsonData.data) {
  //     for (const block of jsonData.data) {
  //       for (const receipt of block.receipts || []) {
  //         for (const log of receipt.logs || []) {
  //           // Check if this is a TokenCreated event from your contract
  //           // Process accordingly
  //           console.log('Processing log:', log);
  //         }
  //       }
  //     }
  //   }
  // } catch (error: any) {
  //   console.log('Error parsing JSON:', error.message);
  //   console.log('Raw body:', body);
  // }

  return c.text('Webhook received');
});

// Default 404 for all other routes
app.notFound((c) => c.text('404 Not Found', 404));

console.log(`QuickNode Streams webhook server running on port ${PORT}`);
serve({
  fetch: app.fetch,
  port: Number(PORT),
});
