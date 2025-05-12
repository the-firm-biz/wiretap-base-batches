import { HttpDb, singletonDb } from '@wiretap/db';
import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { serverEnv } from '@/serverEnv';
import { verifyJwt } from '@/app/utils/jwt/verify-jwt';
import { SiweMessage } from 'siwe';
import { VerifySiweMessageJwtPayload } from '@/app/utils/siwe/types';
import { createHttpPublicClient, ViemClient } from '@wiretap/utils/shared';
import {
  getSingletonNeynarClient,
  NeynarAPIClient
} from '@wiretap/utils/server';

export const createInnerContext = (opts: {
  headers: Headers;
}): {
  db: HttpDb;
  neynarClient: NeynarAPIClient;
  viemClient: ViemClient;
  headers: Headers;
} => {
  const db = singletonDb({ databaseUrl: serverEnv.DATABASE_URL });
  const neynarClient = getSingletonNeynarClient({
    apiKey: serverEnv.NEYNAR_API_KEY
  });
  const viemClient = createHttpPublicClient({
    alchemyApiKey: serverEnv.SERVER_ALCHEMY_API_KEY
  });

  return {
    db,
    neynarClient,
    viemClient,
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

const isAuthed = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.headers.get('Authorization');
  if (!authHeader) {
    throw new TRPCError({
      message: 'No Authorization header',
      code: 'UNAUTHORIZED'
    });
  }

  const authJwt = authHeader.split(' ')[1];
  const { message, signature, wireTapAccountId } =
    verifyJwt<VerifySiweMessageJwtPayload>(authJwt, serverEnv.SIWE_JWT_SECRET);

  const siweMessage = new SiweMessage(message);
  const { success } = await siweMessage.verify({
    signature: signature
  });

  if (!success) {
    throw new TRPCError({
      message: 'isAuthed middleware:: Invalid signature',
      code: 'UNAUTHORIZED'
    });
  }

  return next({
    ctx: {
      authedAddress: siweMessage.address,
      wireTapAccountId
    }
  });
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
/**
 * Uses middleware validating that the SIWE session cookie is valid
 */
export const privateProcedure = t.procedure.use(isAuthed);
