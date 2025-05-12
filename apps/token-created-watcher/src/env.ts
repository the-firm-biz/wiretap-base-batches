import { config } from 'dotenv';
import { z } from 'zod';
import { stringBool, getEnv } from '@wiretap/utils/shared';

config({ path: '.env.local' });

const envSchema = z.object({
  SLACK_ESPIONAGEBOT_TOKEN: z.string(),
  SLACK_INFRABOT_TOKEN: z.string(),
  WIRETAP_NOTIFICATIONS_CHANNEL_ID: z.string(),
  INFRA_NOTIFICATIONS_CHANNEL_ID: z.string(),
  NEYNAR_API_KEY: z.string(),
  ALCHEMY_API_KEY: z.string(),
  DATABASE_URL: z.string(),
  IS_SLACK_NOTIFICATION_ENABLED: stringBool,
  REDIS_URL: z.string()
});

export type Env = z.infer<typeof envSchema>;

export const env = getEnv(envSchema);
