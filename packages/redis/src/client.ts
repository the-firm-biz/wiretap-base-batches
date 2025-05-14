import { Redis } from 'ioredis';

let redis: Redis;

export interface RedisOpts {
  redisUrl: string;
}

export function getRedis(opts: RedisOpts) {
  if (redis) {
    return redis;
  }

  let rejectUnauthorized = true;
  if (opts.redisUrl.startsWith('redis://')) {
    console.warn('Redis connection connection is not using TLS');
    rejectUnauthorized = false;
  }

  redis = new Redis(opts.redisUrl, {
    tls: { rejectUnauthorized }
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
