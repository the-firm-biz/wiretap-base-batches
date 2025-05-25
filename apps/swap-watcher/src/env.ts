import { config } from 'dotenv';
import { z } from 'zod';
import { getEnv, stringBool } from '@wiretap/utils/shared';

config({ path: '.env.local' });

const envSchema = z.object({
  SERVER_ALCHEMY_API_KEY: z.string(),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  REDIS_UNSECURE: stringBool.default("0")
});

export type Env = z.infer<typeof envSchema>;

export const env = getEnv(envSchema);
