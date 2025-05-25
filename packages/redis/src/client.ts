import { Redis } from 'ioredis';
import { type ConnectionOptions } from 'tls';

let redis: Redis;

export interface RedisOpts {
  redisUrl: string;
  unsecure?: boolean;
}

export function getRedis(opts: RedisOpts) {
  if (redis) {
    return redis;
  }

  let tls: ConnectionOptions | undefined = {
    rejectUnauthorized: true
  }
  if (opts.unsecure) {
    console.warn('Redis connection connection is not using TLS');
    tls = undefined;
  }

  redis = new Redis(opts.redisUrl, {
    tls
  });

  redis.on('error', (err: Error) => {
    console.error('Redis connection error:', err);
  });

  redis.on('reconnecting', () => {
    if (redis.status === 'reconnecting')
      console.log('Reconnecting to Redis...');
  });

  redis.on('connect', (err: Error) => {
    if (!err) console.log('Connected to Redis!');
  });

  redis.on('close', () => {
    console.log('Redis connection closed');
  });

  return redis;
}
