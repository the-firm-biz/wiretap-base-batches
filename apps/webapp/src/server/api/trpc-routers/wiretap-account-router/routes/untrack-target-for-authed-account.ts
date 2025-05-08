import { z } from 'zod';
import { privateProcedure } from '@/server/api/trpc';
import { deleteAccountEntityTrackers } from '@wiretap/db';
import { neynarUserSchema } from '@wiretap/utils/server';
import { Address } from 'viem';
import { getExistingAccountInfo } from '../helpers/getExistingAccountInfo';
import { TRPCError } from '@trpc/server';

const trackSchema = z.object({
  evmAddress: z.string(), // TODO: can this be optional?
  neynarUser: neynarUserSchema.optional()
});

export const untrackTargetForAuthedAccount = privateProcedure
  .input(trackSchema)
  .mutation(async ({ ctx, input }): Promise<boolean> => {
    const { db, wireTapAccountId } = ctx;

    const { evmAddress, neynarUser } = input;

    try {
      const { accountEntityId: existingAccountEntityId } =
        await getExistingAccountInfo(db, evmAddress as Address, neynarUser);

      if (existingAccountEntityId) {
        await deleteAccountEntityTrackers(db, {
          wireTapAccountId,
          accountEntityId: existingAccountEntityId
        });
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('trackTargetForAuthedAccount', e);
      const alreadyTracking = e.message?.includes(
        'account_entity_trackers_tracker_wire_tap_account_id_tracked_acc'
      );
      if (alreadyTracking) {
        throw new TRPCError({
          code: e.code || 'INTERNAL_SERVER_ERROR',
          message: 'Already tracking'
        });
      }
      throw new TRPCError({
        code: e.code || 'INTERNAL_SERVER_ERROR',
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
  });
