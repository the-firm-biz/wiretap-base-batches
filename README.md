# Wiretap

> _"While our competitors are deploying today's strategies, we're already
> frontrunning tomorrow's mistakes."_
>
> — Copyright © Franklin J. Merrimont, Founder & Chairman, The Firm

### `/services`

- [token_created_watcher](services/token_created_watcher/README.md)

### `/packages`

- [db](packages/db/README.md)

---

check types & lint

```bash
deno task check
```

Made sure node version v23.11.0 and pnpm 10.8.1 are installed globally

## Integration tests

The repo has ability to spin up local Postgres (with Neon proxy) to run integration tests against.
The `docker-compose.test.yaml` contains minimal Postgres + Neon setup.
The `pretest` and `posttest` scripts sping it up and migrate before the tests (`test` script) and kills the containers when tests are finished (i.e. you exited watchmode).

## Adding tests to pacakges

When introducing tests to a new package do the following:

Install vitest and vite in that package

```
pnpm install -D vitest vite --filter=yourpackagename
```

Update tsconfig compilerOptions.types

```
"compilerOptions": {
    ...
    "types": ["vitest/globals"]
}
```

Add vitest.config.ts
Note that it is running in single thread mode to avoid concurrent DB queries causing issues.
Also make sure properly sweeping the tables before tests to avoid flaky mess.

```
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
        execArgv: ['--env-file=.env.test']
      },
      forks: { singleFork: true, execArgv: ['--env-file=.env.test'] }
    }
  }
});
```

Add `.env.test` to the package with env variables to use during tests

```
DATABASE_URL=postgres://postgres:postgres@db.localtest.me:5432/wiretap-test-db
```
