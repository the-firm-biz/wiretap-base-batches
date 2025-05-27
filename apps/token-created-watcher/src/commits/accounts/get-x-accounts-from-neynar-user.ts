import type { NeynarUser } from '@wiretap/utils/server';

export const getXAccountsFromNeynarUser = (
  neynarUser?: NeynarUser
): string[] => {
  if (!neynarUser) {
    return [];
  }
  return neynarUser?.verified_accounts
    .filter(({ platform }) => platform === 'x')
    .map(({ username }) => username)
    .filter((username) => username !== undefined); // probably some type mistake in Neynar
};
