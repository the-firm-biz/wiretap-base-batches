import { config } from 'dotenv';
import { z } from 'zod';
import { getEnv, secretString } from '@wiretap/utils/shared';

config({ path: '.env.local' });

const envSchema = z.object({
  DATABASE_URL: secretString,
  SUBGRAPH_API_KEY: secretString
});

export type Env = z.infer<typeof envSchema>;

export const env = getEnv(envSchema);
