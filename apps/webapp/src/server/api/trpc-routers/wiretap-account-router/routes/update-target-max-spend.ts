import { z } from 'zod';
import { privateProcedure } from '@/server/api/trpc';
import { updateAccountEntityTracker } from '@wiretap/db';
import { parseEther } from 'viem';
import { TRPCError } from '@trpc/server';

const trackSchema = z.object({
  targetAccountEntityId: z.number(),
  newMaxSpendEth: z.number()
});

type UpdateTargetMaxSpendResponse = {
  newMaxSpendEth: string;
  newMaxSpendWei: string;
};

export const updateTargetMaxSpend = privateProcedure
  .input(trackSchema)
  .mutation(async ({ ctx, input }): Promise<UpdateTargetMaxSpendResponse> => {
    const { db, wireTapAccountId } = ctx;

    const { targetAccountEntityId, newMaxSpendEth } = input;

    const newMaxSpendWei = parseEther(newMaxSpendEth.toString());

    try {
      await updateAccountEntityTracker(db, {
        trackerWireTapAccountId: wireTapAccountId,
        trackedAccountEntityId: targetAccountEntityId,
        maxSpend: newMaxSpendWei
      });
      return {
        newMaxSpendEth: newMaxSpendEth.toString(),
        newMaxSpendWei: newMaxSpendWei.toString()
      };
    } catch (e: any) {
      console.error('updateTargetMaxSpend', e);
      throw new TRPCError({
        code: e.code || 'INTERNAL_SERVER_ERROR',
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
  });
