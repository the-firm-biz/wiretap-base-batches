import {
  createGliderPortfolioRebalance,
  type HttpDb,
  insertGliderPortfolioRebalanceLog,
  type ServerlessDb,
  type ServerlessDbTransaction,
  type TokenBuyerPortfolio
} from '@wiretap/db';

export async function createPortfolioRebalance(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  balance: bigint,
  tokenPercentageBps: number,
  { portfolio, token }: TokenBuyerPortfolio
): Promise<number> {
  const rebalanceId = await createGliderPortfolioRebalance(db, {
    portfolioId: portfolio!.wireTapId,
    tokenId: token.id,
    portfolioEthBalanceWei: balance,
    tokenRatioBps: tokenPercentageBps
  });
  await insertGliderPortfolioRebalanceLog(db, {
    gliderPortfolioRebalancesId: rebalanceId,
    action: 'CREATED'
  });
  return rebalanceId;
}