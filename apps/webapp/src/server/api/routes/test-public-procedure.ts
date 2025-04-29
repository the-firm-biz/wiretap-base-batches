import { publicProcedure } from '../trpc';

export const testPublicProcedure = publicProcedure.query(() => {
  return new Date().toISOString();
});
