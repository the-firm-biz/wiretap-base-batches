import { createTRPCRouter } from '../../trpc';
import { getGliderCreatePortfolioSignatureData } from './routes/get-glider-create-portfolio-signature-data';
import { createGliderPortfolio } from './routes/create-glider-portfolio';
import { getGliderDepositCallData } from './routes/get-glider-create-portfolio-signature-data copy';

export const gliderRouter = createTRPCRouter({
  getGliderCreatePortfolioSignatureData: getGliderCreatePortfolioSignatureData,
  createGliderPortfolio: createGliderPortfolio,
  getGliderDepositCallData: getGliderDepositCallData
});

export type GliderRouter = typeof gliderRouter;
export type GliderRouterKeys = keyof typeof gliderRouter;
