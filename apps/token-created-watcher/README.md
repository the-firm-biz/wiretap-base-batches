### `token_created_watcher`

Monitors Clanker 3.1 token creation events.

`src/env.ts` - Environment variable configuration and validation using Zod schema

`src/main.ts` - Entry point that runs the watcher and handles graceful shutdown

`src/start-watcher.ts` - Core watcher logic that sets up and manages the contract event
subscription

<!-- @TODO - UPDATE -->

```bash
# Run the service
# scripts/dev_token_created.ts
deno task dev:token-created-watcher
```
