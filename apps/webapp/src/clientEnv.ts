import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_REOWN_PROJECT_ID: z.string()
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

const clientEnvValues = {
  NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID
};

// Doesn't make use of the getEnv util because of how NextJs handles client-side env variables
export const clientEnv = clientEnvSchema.parse(clientEnvValues);
