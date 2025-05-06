import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  wireTapSessionKeys,
  getWireTapAccountSessionKey,
  PooledDbConnection
} from '@wiretap/db';
import { createTRPCRouter, privateProcedure } from '../trpc';
import { encryptSessionKey } from '../../kernel/encrypt-decrypt-session-key';
import { createKernelClient } from '../../kernel/create-kernel-client';
import { serverEnv } from '@/serverEnv';
import { initialiseSessionKey } from '@/server/kernel/initialise-session-key';

export const createWireTapSessionRouter = createTRPCRouter({
  createWireTapSession: privateProcedure
    .input(z.object({ serializedSessionKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { wireTapAccountId } = ctx;
      const { serializedSessionKey } = input;

      const { db: poolDb, endPoolConnection } = new PooledDbConnection({
        databaseUrl: serverEnv.DATABASE_URL
      });

      try {
        const currentSessionKey = await getWireTapAccountSessionKey(
          poolDb,
          wireTapAccountId
        );

        if (currentSessionKey) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Session key already exists'
          });
        }

        // Encrypt the serialized session key
        const encryptedSessionKey = encryptSessionKey(serializedSessionKey);

        // Store the encrypted session key in the database
        await poolDb
          .insert(wireTapSessionKeys)
          .values({ wireTapAccountId, encryptedSessionKey })
          .returning();

        // Initialise the session key
        const kernelClient = await createKernelClient(serializedSessionKey);
        const success = await initialiseSessionKey(kernelClient);

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to initialise session key'
          });
        }
      } catch (error) {
        console.error('Failed to create account entity', error);
        await endPoolConnection();

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create account entity'
        });
      } finally {
        await endPoolConnection();
      }
    })
});
