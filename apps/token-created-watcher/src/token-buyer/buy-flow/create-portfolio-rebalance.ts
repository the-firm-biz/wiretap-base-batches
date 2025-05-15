import {
  createGliderPortfolioRebalance,
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction
} from '@wiretap/db';

type CreatePortfolioRebalanceParams = {
  balance: bigint;
  tokenPercentageBps: number;
  portfolioId: number;
  tokenId: number;
};

export async function createPortfolioRebalance(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  {
    balance,
    tokenPercentageBps,
    portfolioId,
    tokenId
  }: CreatePortfolioRebalanceParams
): Promise<number> {
  const rebalanceId = await createGliderPortfolioRebalance(db, {
    portfolioId,
    tokenId,
    portfolioEthBalanceWei: balance,
    tokenRatioBps: tokenPercentageBps
  });
  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    label: 'CREATED'
  });
  return rebalanceId;
}
