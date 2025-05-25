import { HermesClient } from '@pythnetwork/hermes-client';
import { ETH_USD_PRICE_ID } from '@wiretap/config';
import { logger } from '../../shared/index.js';

const RETRY_DELAY = 10000;
const CONNECTION_ATTEMPT_TIMEOUT = 1000 * 30;

const connection = new HermesClient('https://hermes.pyth.network');

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  retryCount: number;
}

type PriceUpdatesStream = Awaited<
  ReturnType<typeof connection.getPriceUpdatesStream>
>;

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

let priceUpdatesStream: PriceUpdatesStream | null = null;
const close = () => {
  if (priceUpdatesStream) {
    priceUpdatesStream.close();
  }
};

const connectionState: ConnectionState = {
  isConnected: false,
  isConnecting: false,
  retryCount: 0
};

function updateConnectionState(
  update: Partial<ConnectionState>,
  isConnectionAttempt = false
) {
  Object.assign(connectionState, update);

  if (isConnectionAttempt) {
    connectionState.retryCount++;
  }
}

export async function initPriceFeeds() {
  if (connectionState.isConnecting || connectionState.isConnected) {
    return close;
  }

  try {
    updateConnectionState({ isConnecting: true, isConnected: false }, true);

    if (connectionState.retryCount > 1) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      logger.info(`Reconnecting... attempt #${connectionState.retryCount}`);
    } else {
      logger.info('Initializing price feeds...');
    }

    if (priceUpdatesStream) {
      priceUpdatesStream.close();
    }

    const priceIds = SUPPORTED_CURRENCIES.map(
      (currency) => priceFeeds[currency].id
    );

    priceUpdatesStream = await connection.getPriceUpdatesStream(priceIds, {
      benchmarksOnly: true
    });

    priceUpdatesStream.onopen = () => {
      logger.info('Price feeds initialized');
      updateConnectionState({ isConnected: true, isConnecting: false });
    };

    priceUpdatesStream.onmessage = (event) => {
      try {
        const priceUpdates = JSON.parse(event.data).parsed as PriceUpdate[];

        Object.values(priceFeeds).forEach((priceFeed) => {
          const priceUpdate = priceUpdates.find((update) =>
            update.id.includes(priceFeed.id)
          );

          if (priceUpdate) {
            priceFeeds[priceFeed.name].price = processUpdate(priceUpdate);
          }
        });
      } catch (error) {
        logger.error(`Error parsing price update`, error, event);
      }
    };

    priceUpdatesStream.onerror = (error) => {
      logger.error('Error receiving updates:', error);
      updateConnectionState({ isConnected: false, isConnecting: false });

      if (priceUpdatesStream) {
        priceUpdatesStream.close();
      }

      logger.info('Reconnecting to price feeds...');
      initPriceFeeds();
    };

    setTimeout(() => {
      if (!connectionState.isConnected && connectionState.isConnecting) {
        updateConnectionState({ isConnecting: false });
        throw new Error('Price feeds connection attempt timed out');
      }
    }, CONNECTION_ATTEMPT_TIMEOUT);

    return close;
  } catch (error) {
    logger.error('Error initializing price feeds:', error);
    return initPriceFeeds();
  }
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
    logger.warn(`Price update for ${currency} not found. Fetching...`);
    return await fetchUpdate();
  }

  if (priceFeed.price.lastUpdated.getTime() < Date.now() - 1000 * 60) {
    logger.error(`Price update for ${currency} is stale. Fetching...`);
    return await fetchUpdate();
  }

  return priceFeed.price;
}
