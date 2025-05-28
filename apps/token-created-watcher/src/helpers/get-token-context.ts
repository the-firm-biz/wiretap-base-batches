import { type ParsedTokenContext } from '../types/index.js';
import type { DeployTokenArgs } from './get-transaction-context.js';

export const getTokenContext = (
  transactionArgs: DeployTokenArgs
): ParsedTokenContext => {
  const tokenConfig = transactionArgs.tokenConfig;
  // TODO: zod? (note that zod might be slow)
  const tokenContext = JSON.parse(tokenConfig.context) as ParsedTokenContext;

  return tokenContext;
};
