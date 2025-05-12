import { config } from 'dotenv';
import { z } from 'zod';
import { getEnv } from '@wiretap/utils/shared';

const envFile = process.env.VITEST ? '.env.test' : '.env.local';
config({ path: envFile });

const envSchema = z.object({
  DATABASE_URL: z.string()
});

export type Env = z.infer<typeof envSchema>;

export const env = getEnv(envSchema);
