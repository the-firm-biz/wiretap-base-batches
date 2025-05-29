import type { NeynarUser } from '@wiretap/utils/server';

export const getXAccountsFromNeynarUser = (
  neynarUser?: NeynarUser
): string[] | undefined => {
  if (
    !neynarUser ||
    !neynarUser.verified_accounts ||
    neynarUser.verified_accounts.length === 0
  ) {
    return undefined;
  }
  return neynarUser.verified_accounts
    .filter(({ platform }) => platform === 'x')
    .map(({ username }) => username)
    .filter((username) => username !== undefined); // probably some type mistake in Neynar
};
