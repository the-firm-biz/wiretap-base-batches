import { HermesClient } from '@pythnetwork/hermes-client';
import { ETH_USD_PRICE_ID } from '@wiretap/config';

const connection = new HermesClient('https://hermes.pyth.network');

const SUPPORTED_CURRENCIES = ['eth_usd'] as const;
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

interface Price {
  raw: bigint;
  decimals: number;
  formatted: number;
  lastUpdated: Date;
}

interface PriceFeed {
  id: string;
  name: SupportedCurrency;
  price?: Price;
}

interface PriceUpdate {
  id: string;
  price: {
    price: string;
    expo: number;
    publish_time: number;
  };
}

const priceFeeds: Record<SupportedCurrency, PriceFeed> = {
  eth_usd: { id: ETH_USD_PRICE_ID, name: 'eth_usd' }
};

function processUpdate(priceUpdate: PriceUpdate) {
  const priceFormatted =
    Number(priceUpdate.price.price) / 10 ** Math.abs(priceUpdate.price.expo);

  return {
    raw: BigInt(priceUpdate.price.price),
    decimals: Math.abs(priceUpdate.price.expo),
    formatted: priceFormatted,
    lastUpdated: new Date(priceUpdate.price.publish_time * 1000)
  };
}

export async function initPriceFeeds() {
  console.log('Initializing price feeds...');
  const priceIds = SUPPORTED_CURRENCIES.map(
    (currency) => priceFeeds[currency].id
  );

  const priceUpdatesStream = await connection.getPriceUpdatesStream(priceIds, {
    benchmarksOnly: true
  });

  priceUpdatesStream.onmessage = (event) => {
    try {
      const priceUpdates = JSON.parse(event.data).parsed as PriceUpdate[];

      Object.values(priceFeeds).forEach((priceFeed) => {
        const priceUpdate = priceUpdates.find((update) =>
          update.id.includes(priceFeed.id)
        );

        if (!priceUpdate) {
          return;
        }

        priceFeeds[priceFeed.name].price = processUpdate(priceUpdate);
      });
    } catch (error) {
      console.error('Error parsing price update:', error, event.data);
    }
  };

  priceUpdatesStream.onerror = (error) => {
    console.error('Error receiving updates:', error);
    priceUpdatesStream.close();

    console.log('Reconnecting to price feeds...');
    initPriceFeeds();
  };

  console.log('Price feeds initialized');

  return () => {
    priceUpdatesStream.close();
  };
}

export async function fetchLatest(currency: SupportedCurrency): Promise<Price> {
  const priceFeed = priceFeeds[currency];

  const fetchUpdate = async () => {
    const priceUpdates = await connection.getLatestPriceUpdates([priceFeed.id]);
    const priceUpdate = priceUpdates.parsed?.find(
      (update) => update.id === priceFeed.id
    );

    if (!priceUpdate) {
      throw new Error(`Price update for ${currency} not found`);
    }

    const price = processUpdate(priceUpdate);

    priceFeed.price = price;

    return price;
  };

  if (!priceFeed.price) {
    console.warn(`Price update for ${currency} not found. Fetching...`);
    return await fetchUpdate();
  }

  if (priceFeed.price.lastUpdated.getTime() < Date.now() - 1000 * 60) {
    console.error(`Price update for ${currency} is stale. Fetching...`);
    return await fetchUpdate();
  }

  return priceFeed.price;
}
