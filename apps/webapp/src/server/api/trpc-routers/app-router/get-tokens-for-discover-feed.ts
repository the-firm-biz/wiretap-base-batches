import { publicProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import {
  getTokensWithCreatorMetadata,
  TokenWithCreatorMetadata,
  TokenWithCreatorMetadataCursor
} from '@wiretap/db';
import { z } from 'zod';

export const getTokensForDiscoverFeed = publicProcedure
  .input(
    z
      .object({
        cursor: z
          .object({
            createdAt: z.date(),
            id: z.number()
          })
          .optional()
      })
      .optional()
  )
  .query(
    async ({
      ctx,
      input
    }): Promise<{
      tokens: TokenWithCreatorMetadata[];
      nextCursor: TokenWithCreatorMetadataCursor | undefined;
    }> => {
      const { db } = ctx;
      const { cursor } = input || {};

      const tokens = await getTokensWithCreatorMetadata(db, {
        cursor
      });

      if (!tokens) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No tokens found'
        });
      }

      const lastToken = tokens.at(-1);
      const nextCursor: TokenWithCreatorMetadataCursor | undefined = lastToken
        ? {
            createdAt: lastToken.tokenCreatedAt,
            id: lastToken.tokenId
          }
        : undefined;

      return { tokens, nextCursor };
    }
  );
