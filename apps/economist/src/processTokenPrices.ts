import {
  getAllTokens,
  singletonDb,
  updateTokensAthPriceUsd,
  type Token
} from '@wiretap/db';
import { env } from './env.js';
import { getTokenPrices } from './getTokenPrices.js';

type TokenAthUpdate = {
  id: Token['id'];
  athPriceUsd: NonNullable<Token['athPriceUsd']>;
};

export async function processTokenPrices() {
  console.log('Processing token prices');
  const startTime = performance.now();
  const db = singletonDb({ databaseUrl: env.DATABASE_URL });
  const tokens = await getAllTokens(db);

  const prices = await getTokenPrices(tokens);

  const tokensWithNewAth = prices.reduce<TokenAthUpdate[]>(
    (acc, tokenWithPrice) => {
      if (tokenWithPrice.price.gt(tokenWithPrice.token.athPriceUsd ?? 0)) {
        acc.push({
          id: tokenWithPrice.token.id,
          athPriceUsd: tokenWithPrice.price.toString()
        });
        return acc;
      }
      return acc;
    },
    []
  );

  const updatedTokens = await updateTokensAthPriceUsd(db, tokensWithNewAth);
  const endTime = performance.now();
  return {
    updatedTokensCount: updatedTokens.length,
    timeTakenMs: endTime - startTime
  };
}
