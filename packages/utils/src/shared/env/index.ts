import { z } from 'zod';

/**
 * Util to retrieve and parse the environment variables given a zod schema
 */
export function getEnv<T extends z.ZodObject<Record<string, z.ZodTypeAny>>>(
  schema: T
) {
  const envKeys = Object.keys(schema.shape);
  const envObject = Object.fromEntries(
    envKeys.map((key) => [key, process.env[key]])
  );

  return schema.parse(envObject);
}

/**
 * Util to prevent leaking secrets in error messages
 */
function secretErrorMap(issue: z.core.$ZodRawIssue<z.core.$ZodIssue>) {
  return `Error (${issue.code}) for ${issue.path?.join('.')}`;
}

/**
 * String validation without logging the content
 */
export const secretString = z.string({
  error: secretErrorMap
});
