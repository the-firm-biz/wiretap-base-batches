import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../client.js';
import { currencies } from '../schema/currencies.js';
import { lowerEq } from '../utils/pg-helpers.js';

export async function getCurrency(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  currencyAddress: `0x${string}`
) {
  const [existingCurrency] = await db
    .select()
    .from(currencies)
    .where(lowerEq(currencies.address, currencyAddress));

  return existingCurrency;
}
