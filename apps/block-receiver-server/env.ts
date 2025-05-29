import { config } from 'dotenv';
import { z } from 'zod';
import { getEnv } from '@wiretap/utils/shared';

config({ path: '.env.local' });

const envSchema = z.object({
  RPC_TRANSPORT_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const env = getEnv(envSchema);
