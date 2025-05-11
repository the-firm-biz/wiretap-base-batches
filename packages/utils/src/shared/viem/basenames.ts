import {
  type Address,
  type ContractFunctionParameters,
  encodePacked,
  keccak256,
  namehash
} from 'viem';
import { base, mainnet } from 'viem/chains';
import { L2ResolverAbi } from '@wiretap/config';
import type { ViemClient } from './clients.js';

export type Basename = `${string}.base.eth`;

export const BASENAME_L2_RESOLVER_ADDRESS =
  '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD';

export enum BasenameTextRecordKeys {
  Description = 'description',
  Keywords = 'keywords',
  Url = 'url',
  Email = 'email',
  Phone = 'phone',
  Github = 'com.github',
  Twitter = 'com.twitter',
  Farcaster = 'xyz.farcaster',
  Lens = 'xyz.lens',
  Telegram = 'org.telegram',
  Discord = 'com.discord',
  Avatar = 'avatar'
}

export const textRecordsKeysEnabled = [
  BasenameTextRecordKeys.Description,
  BasenameTextRecordKeys.Keywords,
  BasenameTextRecordKeys.Url,
  BasenameTextRecordKeys.Github,
  BasenameTextRecordKeys.Email,
  BasenameTextRecordKeys.Phone,
  BasenameTextRecordKeys.Twitter,
  BasenameTextRecordKeys.Farcaster,
  BasenameTextRecordKeys.Lens,
  BasenameTextRecordKeys.Telegram,
  BasenameTextRecordKeys.Discord,
  BasenameTextRecordKeys.Avatar
];

export async function getBasenameAvatar(
  viemClient: ViemClient,
  basename: Basename
) {
  try {
    // Instead of using getEnsAvatar which calls resolve, use the text record directly
    const avatarText = await getBasenameTextRecord(
      viemClient,
      basename,
      BasenameTextRecordKeys.Avatar
    );

    return avatarText || undefined;
  } catch (error) {
    console.log('getBasenameAvatar error', error);
    return undefined;
  }
}

export function buildBasenameTextRecordContract(
  basename: Basename,
  key: BasenameTextRecordKeys
): ContractFunctionParameters {
  return {
    abi: L2ResolverAbi,
    address: BASENAME_L2_RESOLVER_ADDRESS,
    args: [namehash(basename), key],
    functionName: 'text'
  };
}

// Get a single TextRecord
export async function getBasenameTextRecord(
  viemClient: ViemClient,
  basename: Basename,
  key: BasenameTextRecordKeys
) {
  try {
    const contractParameters = buildBasenameTextRecordContract(basename, key);
    const textRecord = await viemClient.readContract(contractParameters);
    return textRecord as string;
  } catch (error) {
    console.debug('getBasenameTextRecord error', error);
  }
}

// Get a all TextRecords
export async function getBasenameTextRecords(
  viemClient: ViemClient,
  basename: Basename
) {
  try {
    const readContracts: ContractFunctionParameters[] =
      textRecordsKeysEnabled.map((key) =>
        buildBasenameTextRecordContract(basename, key)
      );
    const textRecords = await viemClient.multicall({
      contracts: readContracts
    });

    return textRecords;
  } catch (error) {
    console.debug('getBasenameTextRecords error', error);
  }
}

/**
 * Convert an chainId to a coinType hex for reverse chain resolution
 */
export const convertChainIdToCoinType = (chainId: number): string => {
  // L1 resolvers to addr
  if (chainId === mainnet.id) {
    return 'addr';
  }

  const cointype = (0x80000000 | chainId) >>> 0;
  return cointype.toString(16).toLocaleUpperCase();
};

/**
 * Convert an address to a reverse node for ENS resolution
 */
const convertReverseNodeToBytes = (
  address: Address,
  chainId: number
): `0x${string}` => {
  const addressFormatted = address.toLocaleLowerCase() as Address;
  const addressNode = keccak256(addressFormatted.substring(2) as Address);
  const chainCoinType = convertChainIdToCoinType(chainId);
  const baseReverseNode = namehash(
    `${chainCoinType.toLocaleUpperCase()}.reverse`
  );
  const addressReverseNode = keccak256(
    encodePacked(['bytes32', 'bytes32'], [baseReverseNode, addressNode])
  );
  return addressReverseNode;
};

/**
 * Get the basename for an address
 */
export async function getBasename(
  viemClient: ViemClient,
  address: Address
): Promise<Basename | undefined> {
  try {
    const addressReverseNode = convertReverseNodeToBytes(address, base.id);
    const basename = await viemClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'name',
      args: [addressReverseNode]
    });
    if (basename) {
      return basename as Basename;
    }
  } catch (error) {
    console.debug('getBasename error', error);
  }
}

export const getAddressByBasename = async (
  viemClient: ViemClient,
  basename: Basename
) => {
  try {
    const node = namehash(basename);
    const address = await viemClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'addr',
      args: [node]
    });
    return address as Address;
  } catch (error) {
    console.debug('getAddressByBasename error', error);
    return undefined;
  }
};
