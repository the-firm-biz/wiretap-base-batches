import { z } from 'zod';
import { privateProcedure } from '@/server/api/trpc';
import { deleteAccountEntityTrackers } from '@wiretap/db';
import { TRPCError } from '@trpc/server';

const trackSchema = z.object({
  targetAccountEntityId: z.number()
});

export const untrackTargetForAuthedAccount = privateProcedure
  .input(trackSchema)
  .mutation(async ({ ctx, input }): Promise<boolean> => {
    const { db, wireTapAccountId } = ctx;

    const { targetAccountEntityId } = input;

    try {
      await deleteAccountEntityTrackers(db, {
        wireTapAccountId,
        accountEntityId: targetAccountEntityId
      });
      return true;
    } catch (e: any) {
      console.error('untrackTargetForAuthedAccount', e);
      throw new TRPCError({
        code: e.code || 'INTERNAL_SERVER_ERROR',
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
  });
