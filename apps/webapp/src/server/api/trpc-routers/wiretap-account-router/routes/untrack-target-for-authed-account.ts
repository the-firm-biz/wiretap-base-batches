import { z } from 'zod';
import { privateProcedure } from '@/server/api/trpc';
import { deleteAccountEntityTrackers } from '@wiretap/db';
import { neynarUserSchema } from '@wiretap/utils/server';
import { Address } from 'viem';
import { getExistingAccountInfo } from '../helpers/getExistingAccountInfo';
import { TRPCError } from '@trpc/server';

const trackSchema = z.object({
  targetEvmAddress: z.string(), // TODO: can this be optional?
  targetNeynarUser: neynarUserSchema.optional()
});

export const untrackTargetForAuthedAccount = privateProcedure
  .input(trackSchema)
  .mutation(async ({ ctx, input }): Promise<boolean> => {
    const { db, wireTapAccountId } = ctx;

    const { targetEvmAddress, targetNeynarUser } = input;

    try {
      const { accountEntityId: targetAccountEntityId } =
        await getExistingAccountInfo(
          db,
          targetEvmAddress as Address,
          targetNeynarUser
        );

      if (targetAccountEntityId) {
        await deleteAccountEntityTrackers(db, {
          wireTapAccountId,
          accountEntityId: targetAccountEntityId
        });
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('untrackTargetForAuthedAccount', e);
      throw new TRPCError({
        code: e.code || 'INTERNAL_SERVER_ERROR',
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
  });
