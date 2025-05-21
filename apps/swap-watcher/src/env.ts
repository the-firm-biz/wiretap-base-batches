import { config } from 'dotenv';
import { z } from 'zod';
import { getEnv } from '@wiretap/utils/shared';

config({ path: '.env.local' });

const envSchema = z.object({
  SERVER_ALCHEMY_API_KEY: z.string(),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  SLACK_INFRABOT_TOKEN: z.string(),
  INFRA_NOTIFICATIONS_CHANNEL_ID: z.string()
});

export type Env = z.infer<typeof envSchema>;

export const env = getEnv(envSchema);
