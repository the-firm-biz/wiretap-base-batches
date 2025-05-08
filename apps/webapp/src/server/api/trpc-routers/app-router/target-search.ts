import z from 'zod';
import {
  fetchBulkUsersByEthOrSolAddress,
  type NeynarAPIClient,
  type NeynarUser,
  searchByUsername
} from '@wiretap/utils/server';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { Address, isAddress } from 'viem';
import {
  type Basename,
  getAddressByBasename,
  getBasename,
  getBasenameAvatar,
  isAddressEqual,
  type ViemClient
} from '@wiretap/utils/shared';
import { SearchTarget } from '@/app/utils/target/types';

const getAccountImage = async (
  viemClient: ViemClient,
  neynarUser?: NeynarUser,
  basename?: Basename
): Promise<string | undefined> => {
  if (neynarUser?.pfp_url) {
    return neynarUser.pfp_url;
  }
  if (basename) {
    const avatar = await getBasenameAvatar(viemClient, basename);
    if (avatar) {
      return avatar;
    }
  }
  return undefined;
};

const getTargetByAddress = async (
  viemClient: ViemClient,
  neynarClient: NeynarAPIClient,
  evmAddress: Address,
  knownBasename?: Basename
): Promise<SearchTarget> => {
  const basename = knownBasename
    ? knownBasename
    : await getBasename(viemClient, evmAddress);

  const neynarUsers = await fetchBulkUsersByEthOrSolAddress(neynarClient, [
    evmAddress
  ]);

  const neynarUser = neynarUsers?.[0];

  const image = await getAccountImage(viemClient, neynarUser, basename);

  return {
    neynarUser,
    basename,
    evmAddress,
    image
  };
};

export const targetSearch = publicProcedure
  .input(
    z.object({
      searchString: z.string(),
      cursor: z.string().optional()
    })
  )
  .query(
    async ({
      input,
      ctx
    }): Promise<{
      results: SearchTarget[];
      nextCursor?: string;
    }> => {
      const { searchString, cursor } = input;
      const { neynarClient, viemClient } = ctx;

      const isBasename = searchString.endsWith('.base.eth');
      const isEVMAddress = isAddress(searchString);

      try {
        const { users: neynarSearchedUsers, nextCursor } =
          await searchByUsername(neynarClient, searchString, cursor);

        const searchResults: SearchTarget[] = neynarSearchedUsers.map(
          (user) => ({
            neynarUser: user
          })
        );

        // If cursor is provided we already checked for exact matches - early return
        if (cursor) {
          return { results: searchResults, nextCursor };
        }

        // Prepend the results with exact match via basename (if not already present in Neynar search results)
        if (isBasename) {
          const evmAddress = await getAddressByBasename(
            viemClient,
            searchString as Basename
          );
          if (evmAddress) {
            const isAlreadyInResults = neynarSearchedUsers?.some((user) =>
              user.verified_addresses.eth_addresses.some((address) =>
                isAddressEqual(address, evmAddress)
              )
            );
            if (!isAlreadyInResults) {
              const targetViaAddress = await getTargetByAddress(
                viemClient,
                neynarClient,
                evmAddress,
                searchString as Basename
              );
              searchResults.unshift(targetViaAddress);
            }
          }
        }

        // Prepend the results with exact match via EVM address (if not already present in Neynar search results)
        if (isEVMAddress) {
          const isAlreadyInResults = neynarSearchedUsers?.some((user) =>
            user.verified_addresses.eth_addresses.some((address) =>
              isAddressEqual(address, searchString)
            )
          );
          if (!isAlreadyInResults) {
            const targetViaAddress = await getTargetByAddress(
              viemClient,
              neynarClient,
              searchString
            );
            searchResults.unshift(targetViaAddress);
          }
        }

        return { results: searchResults, nextCursor };
      } catch (e: any) {
        console.error('targetSearch', e);
        throw new TRPCError({
          code: e.code || 'INTERNAL_SERVER_ERROR',
          message: e.message || e
        });
      }
    }
  );
