import { handleNotifySlack, type NeynarUser } from '@wiretap/utils/server';
import { getTokenContext } from '../get-token-context.js';
import { env } from '../env.js';
import {
  CLANKER_3_1_ADDRESS,
  DELEGATED_CLANKER_DEPLOYER_ADDRESSES
} from '@wiretap/config';

type SlackMessageDetails = {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  transactionHash: string;
  deployerContractAddress: string;
  neynarUser?: NeynarUser;
  source: string;
  castValidation?: {
    exists: boolean;
    isValid: boolean;
  };
  latencyMs?: number;
};

const divider = '='.repeat(56);

const slackLink = (emoji: string | null, url: string, text: string) => {
  if (emoji) {
    return `:${emoji}: <${url}|${text}>`;
  }
  return `<${url}|${text}>`;
};

const formatAddressList = (
  addresses: string[],
  primaryAddress: string,
  baseUrl: string,
  label: string
): string => {
  if (addresses.length > 0) {
    const ethAddressesList = addresses.map((address) => {
      const isPrimary = address === primaryAddress;
      return (
        slackLink(null, `${baseUrl}/${address}`, address) +
        (isPrimary ? ' (Primary)' : '')
      );
    });
    return `
${label}:
${ethAddressesList.join('\n')}
`;
  }
  return '';
};

const formatAccountList = (
  accounts: NeynarUser['verified_accounts'],
  platform: 'x' | 'github',
  baseUrl: string,
  label: string
): string => {
  const platformAccounts = accounts.filter(
    (account) => account.platform === platform && account.username
  );
  if (platformAccounts.length > 0) {
    return `
${label}:
${platformAccounts.map((account) => slackLink(null, `${baseUrl}/${account.username}`, account.username!)).join('\n')}
`;
  }
  return '';
};

export const sendSlackMessage = async ({
  tokenAddress,
  tokenName,
  tokenSymbol,
  transactionHash,
  deployerContractAddress,
  neynarUser,
  source,
  latencyMs,
  castValidation
}: SlackMessageDetails) => {
  console.log(`${source}: ${tokenName} (${tokenSymbol})`);
  if (!env.IS_SLACK_NOTIFICATION_ENABLED) {
    console.log('Slack notifications are disabled');
    return;
  }

  let mainUrls = `
${slackLink('chart_with_upwards_trend', `https://dexscreener.com/base/${tokenAddress}`, 'DexScreener')}\n
${slackLink('receipt', `https://basescan.org/tx/${transactionHash}`, 'Deployment transaction')}\n
${slackLink('globe_with_meridians', `https://www.clanker.world/clanker/${tokenAddress}`, 'ClankerWorld')}\n
`;

  let tokenContext: string | undefined;
  try {
    const tokenContextJson = await getTokenContext(
      transactionHash as `0x${string}`
    );
    tokenContext =
      '```\n' + JSON.stringify(tokenContextJson, null, 2) + '\n```';

    const canBuildWarpcastUrl =
      tokenContextJson.interface === 'clanker' &&
      tokenContextJson.messageId &&
      neynarUser?.username;
    if (canBuildWarpcastUrl) {
      mainUrls += `${slackLink('mega', `https://warpcast.com/${neynarUser.username}/${tokenContextJson.messageId}`, 'Warpcast Cast')}`;
    }
  } catch (error) {
    const tokenContextError =
      error instanceof Error ? error.message : `${error}`;
    tokenContext = '```\n' + tokenContextError + '\n```';
  }

  let neynarUserData = ':woman-gesturing-no: Neynar user: None';
  if (neynarUser) {
    neynarUserData = `
:person_in_tuxedo: Neynar user: ${slackLink(null, `https://warpcast.com/${neynarUser.username}`, neynarUser.username)} | ${neynarUser.follower_count} followers
    `;

    neynarUserData += formatAccountList(
      neynarUser.verified_accounts,
      'x',
      'https://x.com',
      'X Accounts'
    );
    neynarUserData += formatAccountList(
      neynarUser.verified_accounts,
      'github',
      'https://github.com',
      'Github Accounts'
    );

    neynarUserData += formatAddressList(
      neynarUser.verified_addresses.eth_addresses,
      neynarUser.verified_addresses.primary.eth_address,
      'https://basescan.org/address',
      'ETH Addresses'
    );
    neynarUserData += formatAddressList(
      neynarUser.verified_addresses.sol_addresses,
      neynarUser.verified_addresses.primary.sol_address,
      'https://solscan.io/account',
      'SOL Addresses'
    );
  }

  const deployerName = (() => {
    if (
      deployerContractAddress.toLowerCase() ===
      CLANKER_3_1_ADDRESS.toLowerCase()
    ) {
      return 'Clanker 3.1';
    }
    const delegatedDeployerName = Object.keys(
      DELEGATED_CLANKER_DEPLOYER_ADDRESSES
    ).find(
      (key) =>
        DELEGATED_CLANKER_DEPLOYER_ADDRESSES[key]?.toLowerCase() ===
        deployerContractAddress.toLowerCase()
    );
    return delegatedDeployerName ?? deployerContractAddress;
  })();

  const deployerLink = slackLink(
    null,
    `https://basescan.org/address/${deployerContractAddress}`,
    deployerName
  );
  const heading = `:egg: New Token Created: *${tokenName}* (*${tokenSymbol}*)`;
  const subheading = `Source: \`${source}\` | Deployer: ${deployerLink}`;

  const fullMessage = [
    divider,
    heading,
    subheading,
    mainUrls,
    neynarUserData,
    '*Token Context*',
    tokenContext
  ];

  if (castValidation) {
    switch (true) {
      case castValidation.exists && castValidation.isValid:
        fullMessage.push('Cast validation: all good :white_check_mark:');
        break;
      case castValidation.exists && !castValidation.isValid:
        fullMessage.push(
          'Cast validation: cast found but validation failed :large_red_square:'
        );
        break;
      case !castValidation.exists:
      default:
        fullMessage.push('Cast validation: no cast found :large_red_square:');
    }
  }

  if (latencyMs) {
    const indicatorColor =
      latencyMs <= 500 ? 'green' : latencyMs <= 1000 ? 'orange' : 'red';
    fullMessage.push(
      `:large_${indicatorColor}_circle: Latency from block to db was ${latencyMs}`
    );
  }

  await handleNotifySlack(fullMessage.join('\n'), {
    slackToken: env.SLACK_TOKEN,
    slackChannelId: env.WIRETAP_NOTIFICATIONS_CHANNEL_ID
  });
};
