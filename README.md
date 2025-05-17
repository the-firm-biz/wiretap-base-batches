# WireTap

> _"While our competitors are deploying today's strategies, we're already
> frontrunning tomorrow's mistakes."_
>
> — Copyright © Franklin J. Merrimont, Founder & Chairman, The Firm

---

## Base Batches Judging Council,

## The `main` branch is reserved for our submission to the Base Batches Global Innovation Sprint and will receive no new pushes after submission deadline 23:59 PST 5/16/25. The code on https://wiretap.thefirm.biz is deployed from `main`.

## The WireTap team are continuing to work on the project, this will happen on `develop`

---

### `/apps`

- [token-created-watcher](apps/token-created-watcher/README.md)
- [swap-watcher](apps/swap-watcher/README.md)
- [webapp](apps/webapp/README.md)

### `/packages`

- [db](packages/db/README.md)
- [utils](packages/utils/README.md)

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
pnpm turbo lint ts:check
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

## Code Guidelines

### General Principles

- Write code for <b>others</b>, not yourself.

- Prioritize readability and debuggability.

- Keep code as simple as possible.

- Practice shared ownership: if you see something broken, fix it.

### Function Logic

- Handle edge cases and errors first, happy path last.

- Use early returns to:
  - Eliminate nested `else`/`else if`
  - Avoid `let` reassignment where possible

```typescript
// bad
function processToken(token) {
  if (token) {
    if (token.isActive) {
      // main logic here
    } else {
      throw new Error('Token is not active');
    }
  } else {
    throw new Error('No token provided');
  }
}

// good
function processToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }

  if (!token.isActive) {
    throw new Error('Token is not active');
  }
  // main logic here
}
```

- Keep functions shallow and decoupled - try to avoid embedding unique business logic so they’re easy to reuse and change.

- Abstract complex conditions into semantic variables:

```typescript
 // bad
 if (
   employee.hasBullpenSpeakingPrivileges &&
   !employee.isTerminated &&
   employee.telegramTimeoutMs === 0 &&
 ) {}

 // good
 const canPostInBullpen =
   employee.hasBullpenSpeakingPrivileges &&
   !employee.isTerminated &&
   employee.telegramTimeoutMs === 0

 if (canPostInBullpen) {}
```

- Use objects for functions with >=3 arguments.

- Explicitly type function return values.

### Naming Conventions

- Use descriptive, semantic variable names to make code self-documenting.

```ts
// bad
const cast;
const source;
const result;

// good
const castWithConversation;
const deploymentSource;
const neynarUserResponse;
```

- Prefix booleans with auxiliary verbs like is, has, can, or should.

```typescript
const isLoading;
const canSubmit;
const hasError;
const shouldUpdate;
```

- Prefix functions with a verb describing their action. Avoid ambiguous or noun-only names.

```typescript
// bad
tokenContext();
usersByAddress();
slackMessage();

// good
getTokenContext();
fetchBulkUsersByEthOrSolAddress();
sendSlackMessage();
```

- Avoid abbreviations unless they are well-known and unambiguous.

- Avoid magic numbers/strings - use named constants.

- Prefer named exports.
