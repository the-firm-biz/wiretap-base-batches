import { createTRPCRouter } from '../../trpc';
import { getGliderCreatePortfolioSignatureData } from './routes/get-glider-create-portfolio-signature-data';
import { createGliderPortfolio } from './routes/create-glider-portfolio';
import { withdrawAllEthFromGliderPortfolio } from './routes/withdraw-from-glider-portfolio';
import { getGliderPortfolioAnalysisData } from './routes/get-glider-portfolio-analysis-data';

/**
 * Routes specific to Glider API calls
 */
export const gliderRouter = createTRPCRouter({
  getGliderCreatePortfolioSignatureData: getGliderCreatePortfolioSignatureData,
  getGliderPortfolioAnalysisData: getGliderPortfolioAnalysisData,
  createGliderPortfolio: createGliderPortfolio,
  withdrawAllEthFromGliderPortfolio: withdrawAllEthFromGliderPortfolio
});

export type GliderRouter = typeof gliderRouter;
export type GliderRouterKeys = keyof typeof gliderRouter;
