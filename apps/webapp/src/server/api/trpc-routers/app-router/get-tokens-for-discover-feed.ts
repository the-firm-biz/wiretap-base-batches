import { publicProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { getTokensWithCreatorMetadata } from '@wiretap/db';

export const getTokensForDiscoverFeed = publicProcedure.query(
  // @todo type this.
  async ({ ctx }): Promise<any[]> => {
    const { db } = ctx;

    const tokens = await getTokensWithCreatorMetadata(db);

    if (!tokens) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'INTERNAL_SERVER_ERROR'
      });
    }

    console.log('tokens', tokens);

    return tokens;
  }
);
