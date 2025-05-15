import { getAllPoolAddresses } from '@wiretap/db';
import { getDb } from '@wiretap/db';
import { isAddress, type Address } from 'viem';
import { env } from './env.js';
import { getRedis } from '@wiretap/redis';
import { INDEXING_POOLS_PUBSUB_CHANNEL } from '@wiretap/config';
import { lowercaseAddress } from '@wiretap/utils/shared';

export const pools = new Set<Address>([]);

/**
 * Load all pool addresses from the database
 */
async function persistPools(): Promise<void> {
  try {
    console.log('Persisting pools from database');
    const db = getDb({ databaseUrl: env.DATABASE_URL });

    const poolAddresses = await getAllPoolAddresses(db);

    poolAddresses.forEach((address) => {
      pools.add(lowercaseAddress(address));
    });
    console.log(`Pools persisted with ${poolAddresses.length} addresses`);
  } catch (error) {
    console.error('Failed to backfill pools:', error);
    throw error;
  }
}

/**
 * Start listening for new pool additions via Redis
 */
export const startPoolsWatcher = async (): Promise<() => Promise<void>> => {
  let redis = getRedis({ redisUrl: env.REDIS_URL });
  let isSubscribed = false;
  let isClosed = false;

  const config = {
    reconnectIntervalMs: 5000,
    refetchIntervalMs: 120000,
    channel: INDEXING_POOLS_PUBSUB_CHANNEL
  };

  // Function to handle subscription
  const subscribe = async (): Promise<void> => {
    try {
      await persistPools();
      await redis.subscribe(config.channel);
      isSubscribed = true;
      console.log(`Subscribed to ${config.channel} channel`);
    } catch (err) {
      console.error(`Failed to subscribe to ${config.channel} channel`, err);
      isSubscribed = false;

      // Schedule reconnection on error
      setTimeout(reconnect, config.reconnectIntervalMs);
    }
  };

  // Function to handle reconnection
  const reconnect = async (): Promise<void> => {
    if (isSubscribed) return;

    try {
      console.log('Attempting to reconnect to Redis');
      redis = getRedis({ redisUrl: env.REDIS_URL });

      await subscribe();
    } catch (err) {
      console.error('Redis reconnection failed', err);
      setTimeout(reconnect, config.reconnectIntervalMs);
    }
  };

  // Message handler
  const handleMessage = (channel: string, message: string): void => {
    if (channel !== config.channel) return;

    console.debug(`Received message ${message} on channel ${channel}`);

    try {
      if (!isAddress(message)) {
        console.warn(`Invalid address received ${message}`);
        return;
      }

      pools.add(lowercaseAddress(message));

      console.debug(`Added pool ${message} successfully`);
    } catch (error) {
      console.error('Error processing pool address', error, message);
    }
  };

  redis.on('message', handleMessage);

  redis.on('error', (err) => {
    console.error({ error: err }, 'Redis connection error');
    isSubscribed = false;
    setTimeout(reconnect, config.reconnectIntervalMs);
  });

  redis.on('end', () => {
    console.warn('Redis connection closed');
    isSubscribed = false;
    if (!isClosed) {
      setTimeout(reconnect, config.reconnectIntervalMs);
    }
  });

  await subscribe();
  console.log('Pools watcher started');

  const persistInterval = setInterval(
    () => void persistPools(),
    config.refetchIntervalMs
  );

  // Return cleanup function
  return async (): Promise<void> => {
    console.log('Shutting down Pools watcher');
    clearInterval(persistInterval);

    try {
      isClosed = true;
      if (isSubscribed) {
        await redis.unsubscribe(config.channel);
      }
      await redis.quit();
      console.log('Redis connection closed gracefully');
    } catch (error) {
      console.error('Error during shutdown', error);
    }
  };
};
