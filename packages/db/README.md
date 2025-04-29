# Database Packa

This package provides database access using Drizzle ORM with Neon Postgres.

> <i>All operations target the Neon DB declared in the `DATABASE_URL` env
> variable.</i>

## Setup

1. Create a new Neon branch with parent set to `staging` via the
   [Neon Console](https://console.neon.tech/)
2. Get the connection string for that branch
3. Insert/update the `DATABASE_URL` variable in your `.env.local` with that
   connection string

## Example Usage

Import the database client and schemas from the package:

```typescript
import { db, farcasterAccounts, getPoolDb } from '../packages/db/index.js';
import { eq } from 'drizzle-orm';
import { env } from './env.ts';

// DB query usage example
const allFarcasterAccounts = await db.select().from(farcasterAccounts);

// Transaction example using pooled connection
const { poolDb, endPoolConnection } = getPoolDb({
  databaseUrl: env.DATABASE_URL
});

try {
  await poolDb.transaction(async (tx) => {
    const deployerEntity = await tx
      .insert(deployerEntities)
      .values({ name: 'Jeffrey' })
      .returning();

    await tx
      .update(deployerEntities)
      .set({ name: "Actually, maybe it's not Jeffrey" })
      .where(eq(deployerEntities.id, deployerEntity[0].id));
  });
} finally {
  await endPoolConnection(); // Always close pooled connections
}
```

## Scripts

> **NOTE:** generating migrations in the project root will call `turbo db: ...`, which also type checks and builds dependencies. See `/turbo.json` for more

### Generate Migrations

To generate migrations based on schema changes:

```bash
pnpm run db:migration-generate
```

### Apply Generated Migrations

To apply pending migrations to the database:

```
pnpm run db:migration-push
```

> **NOTE:** you will need to run this after pulling migrations from the remote, to
> push those migrations to your local db instance.

### Generate and Apply Migrations

To generate and apply migrations to the database in one call:

```
pnpm run db:migration
```

> This command is called automatically on the `main` and `develop` branches via
> GH actions when there is any change in the `package/db` folder. Similarly,
> `db:migration` is ran on an automatically generated "preview" Neon branches
> for each PR.
