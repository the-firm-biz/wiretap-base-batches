import { createTRPCRouter } from '../../trpc';
import { getGliderCreatePortfolioSignatureData } from './routes/get-glider-create-portfolio-signature-data';
import { createGliderPortfolio } from './routes/create-glider-portfolio';

/**
 * Routes specific to Glider API calls
 */
export const gliderRouter = createTRPCRouter({
  getGliderCreatePortfolioSignatureData: getGliderCreatePortfolioSignatureData,
  createGliderPortfolio: createGliderPortfolio
});

export type GliderRouter = typeof gliderRouter;
export type GliderRouterKeys = keyof typeof gliderRouter;
