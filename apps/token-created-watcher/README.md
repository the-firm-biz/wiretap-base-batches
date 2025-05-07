### `token_created_watcher`

Monitors Clanker 3.1 token creation events.

`src/env.ts` - Environment variable configuration and validation using Zod schema

`src/main.ts` - Entry point that runs the watcher and handles graceful shutdown

`src/start-watcher.ts` - Core watcher logic that sets up and manages the contract event
subscription

```bash
# Run the service
# from the monorepo root
pnpm dev:watchers
```

## Scenarios where a token will not be indexed

- If the 'TokenCreated' log does not contain any of the following:
  - msgSender
  - tokenAddress
  - symbol
  - tokenName
