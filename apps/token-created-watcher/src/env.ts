import { config } from 'dotenv';
import { z } from 'zod';
import { getEnv, secretString } from '@wiretap/utils/shared';

config({ path: '.env.local' });

const envSchema = z.object({
  SLACK_ESPIONAGEBOT_TOKEN: secretString,
  SLACK_INFRABOT_TOKEN: secretString,
  WIRETAP_NOTIFICATIONS_CHANNEL_ID: z.string(),
  INFRA_NOTIFICATIONS_CHANNEL_ID: z.string(),
  NEYNAR_API_KEY: secretString,
  ALCHEMY_API_KEY: secretString,
  DATABASE_URL: secretString,
  IS_SLACK_NOTIFICATION_ENABLED: z.stringbool()
});

export type Env = z.infer<typeof envSchema>;

export const env = getEnv(envSchema);
