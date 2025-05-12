import { Address } from 'viem';

type SublabelOptions = {
  socialUsername?: string;
  evmAddress?: Address;
};

export const constructSublabel = ({
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
