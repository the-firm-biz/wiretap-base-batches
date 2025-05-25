# QuickNode Stream Webhook

A minimal webhook server for receiving and processing blockchain data from QuickNode Streams, built with Hono.

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev
```

## Exposing locally

To expose your local server to the internet for testing, use ngrok:

```bash
npx ngrok http 3000
```

Use the provided ngrok URL as your webhook destination in QuickNode Streams.

## About This Implementation

This webhook server uses [Hono](https://hono.dev/), a lightweight, fast, web-standards-first framework for edge computing. Key features include:

- Lightweight and minimal footprint
- Fast request handling using web standard APIs
- TypeScript support out of the box

The server exposes a single `/webhook` endpoint that receives and processes blockchain data from QuickNode Streams.

## Production

For production deployment, build the application:

```bash
pnpm build
pnpm start
```

Or deploy using Fly.io (similar to token-created-watcher).
