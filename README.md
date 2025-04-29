# Wiretap

> _"While our competitors are deploying today's strategies, we're already
> frontrunning tomorrow's mistakes."_
>
> — Copyright © Franklin J. Merrimont, Founder & Chairman, The Firm

### `/apps`

- [token-created-watcher](apps/token-created-watcher/README.md)
- [webapp](apps/webapp/README.md)

### `/packages`

- [db](packages/db/README.md)
- [utils](packages/utils/README.md)

---

### Run shit

Everything

```bash
# Defined in turbo.json
pnpm turbo dev
```

`apps/token-created-watcher` + deps in watch mode

```bash
# Defined in root package.json
pnpm dev:watchers
```

`apps/webapp` + deps in watch mode

```bash
# Defined in root package.json
pnpm dev:webapp
```

---

### check types & lint

```bash
deno task check
```

Made sure node version v23.11.0 and pnpm 10.8.1 are installed globally

## Integration tests

The repo has ability to spin up local Postgres (with Neon proxy) to run integration tests against.
The `docker-compose.test.yaml` contains minimal Postgres + Neon setup.

The following package.json scripts are responsible for tests:

- `test-db:start` - spins up local docker containers
- `test-db:migration` - generates and applies latest migrations
- `test-db:stop` - kills local docker containers
- `test` - runs `test-db:start` + `test-db:migration`, then executes all tests in monorepo, in the end runs `test-db:stop` (regardless of exit code of any previous commands). This one should be used in CI or for quick test runs (it uses turborepo cache).
- `test:watch` - same as `test` but runs test in the iteractive watch mode. Not cached. Use this for local development.

## Adding tests to pacakges

When introducing tests to a new package do the following:

Install vitest and vite in that package

```
pnpm install -D vitest vite --filter=yourpackagename
```

Update tsconfig compilerOptions.types

```json
"compilerOptions": {
    ...
    "types": ["vitest/globals"]
}
```

Add vitest.config.ts
Note that it is running in single thread mode to avoid concurrent DB queries causing issues.
Also make sure properly sweeping the tables before tests to avoid flaky mess.

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
        execArgv: ['--env-file=.env.test'],
      },
      forks: { singleFork: true, execArgv: ['--env-file=.env.test'] },
    },
  },
});
```

Add `.env.test` to the package with env variables to use during tests

```
DATABASE_URL=postgres://postgres:postgres@db.localtest.me:5432/wiretap-test-db
```
