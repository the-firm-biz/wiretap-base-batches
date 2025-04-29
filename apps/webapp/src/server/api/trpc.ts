import { singletonDb } from '@wiretap/db';
import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import { serverEnv } from '@/serverEnv';

export const createInnerContext = (opts: { headers: Headers }) => {
  const db = singletonDb({ databaseUrl: serverEnv.DATABASE_URL });

  return {
    db,
    ...opts
  };
};

const t = initTRPC.context<typeof createInnerContext>().create({
  // @TODO trpc - superjson?
  // transformer: superjson
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
    }
  })
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
