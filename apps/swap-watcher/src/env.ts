import { config } from 'dotenv';
import { z } from 'zod';
import { getEnv, secretString } from '@wiretap/utils/shared';

config({ path: '.env.local' });

const envSchema = z.object({
  ALCHEMY_API_KEY: secretString,
  DATABASE_URL: secretString,
  REDIS_URL: secretString
});

export type Env = z.infer<typeof envSchema>;

export const env = getEnv(envSchema);
