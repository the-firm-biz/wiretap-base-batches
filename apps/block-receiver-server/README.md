# QuickNode Stream Webhook

A minimal webhook server for receiving and processing blockchain data from QuickNode Streams, built with Hono.
## Exposing locally

To expose your local server for testing, use ngrok:

```bash
npx ngrok http 8080
```

Use the provided ngrok URL as your webhook destination in QuickNode Streams.