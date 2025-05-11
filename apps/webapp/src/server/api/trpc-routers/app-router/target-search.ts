import z from 'zod';
import {
  fetchBulkUsersByEthOrSolAddress,
  getSingletonNeynarClient,
  NeynarUser,
  searchByUsername
} from '@wiretap/utils/server';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { serverEnv } from '@/serverEnv';
import { Address, isAddress } from 'viem';
import {
  Basename,
  createHttpPublicClient,
  getAddressByBasename,
  getBasename,
  getBasenameAvatar,
  isAddressEqual,
  type ViemClient
} from '@wiretap/utils/shared';
import { clientEnv } from '@/clientEnv';

export type TargetEntity = {
  fid?: number;
  address: Address;
  label: string;
  sublabel?: string;
  followerCount?: number;
  image?: string;
};

type LabelOptions = {
  socialName?: string;
  basename?: Basename;
  evmAddress?: Address;
  socialUsername?: string;
};

const constructLabel = ({
  socialName,
  basename,
  evmAddress,
  socialUsername
}: LabelOptions): string | Basename | Address => {
  if (socialName) {
    return socialName;
  }
  if (basename) {
    return basename;
  }
  if (evmAddress) {
    return evmAddress;
  }
  if (socialUsername) {
    return socialUsername; // Note: user indeed can have nothing at all except username
  }
  // This should never happen due to the type constraint, just to satisfy typescript (never return undefined)
  return 'Unknown';
};

type SublabelOptions = {
  socialUsername?: string;
  evmAddress?: Address;
};

const constructSublabel = ({
  socialUsername,
  evmAddress
}: SublabelOptions): string | Address | undefined => {
  if (socialUsername) {
    return `@${socialUsername}`;
  }
  if (evmAddress) {
    return evmAddress;
  }
  return undefined;
};

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

const getExactTargetByAddress = async (
  viemClient: ViemClient,
  evmAddress: Address,
  knownBasename?: Basename
): Promise<TargetEntity> => {
  const basename = knownBasename
    ? knownBasename
    : await getBasename(viemClient, evmAddress);

  const neynarClient = getSingletonNeynarClient({
    apiKey: serverEnv.NEYNAR_API_KEY
  });

  const neynarUsers = await fetchBulkUsersByEthOrSolAddress(neynarClient, [
    evmAddress
  ]);

  const neynarUser = neynarUsers?.[0];

  const image = await getAccountImage(viemClient, neynarUser, basename);

  return {
    fid: neynarUser?.fid,
    address: evmAddress,
    label: constructLabel({
      socialName: neynarUser?.display_name,
      basename,
      evmAddress,
      socialUsername: neynarUser?.username
    }),
    sublabel: constructSublabel({
      socialUsername: neynarUser?.username,
      evmAddress
    }),
    followerCount: neynarUser?.follower_count,
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
      input
    }): Promise<{
      results: TargetEntity[];
      nextCursor?: string;
    }> => {
      const { searchString, cursor } = input;
      const isBasename = searchString.endsWith('.base.eth');
      const isEVMAddress = isAddress(searchString);

      try {
        const neynarClient = getSingletonNeynarClient({
          apiKey: serverEnv.NEYNAR_API_KEY
        });
        const publicClient = createHttpPublicClient({
          alchemyApiKey: clientEnv.NEXT_PUBLIC_ALCHEMY_API_KEY
        });

        const { users: neynarSearchedUsers, nextCursor } =
          await searchByUsername(neynarClient, searchString, cursor);

        const searchResults: TargetEntity[] = neynarSearchedUsers.map(
          (user) => ({
            fid: user.fid,
            address: user.verified_addresses.primary.eth_address as Address,
            label: constructLabel({
              socialName: user.display_name,
              evmAddress: user.verified_addresses.primary
                .eth_address as Address,
              socialUsername: user.username
            }),
            sublabel: constructSublabel({
              socialUsername: user.username
            }),
            followerCount: user.follower_count,
            image: user.pfp_url
          })
        );

        // If cursor is provided we already checked for exact matches - early return
        if (cursor) {
          return { results: searchResults, nextCursor };
        }

        // Prepend the results with exact match via basename (if not already present in Neynar search results)
        if (isBasename) {
          const evmAddress = await getAddressByBasename(
            publicClient,
            searchString as Basename
          );
          if (evmAddress) {
            const isAlreadyInResults = neynarSearchedUsers?.some((user) =>
              user.verified_addresses.eth_addresses.some((address) =>
                isAddressEqual(address, evmAddress)
              )
            );
            if (!isAlreadyInResults) {
              const account = await getExactTargetByAddress(
                publicClient,
                evmAddress,
                searchString as Basename
              );
              searchResults.unshift(account);
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
            const account = await getExactTargetByAddress(
              publicClient,
              searchString
            );
            searchResults.unshift(account);
          }
        }

        return { results: searchResults, nextCursor };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error('targetSearch', e);
        throw new TRPCError({
          code: e.code || 'INTERNAL_SERVER_ERROR',
          message: e.message || e
        });
      }
    }
  );
