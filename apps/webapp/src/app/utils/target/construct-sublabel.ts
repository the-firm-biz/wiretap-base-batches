import { Address } from 'viem';
import { formatAddress } from '../format/format-address';

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
    return formatAddress(evmAddress);
  }
  return undefined;
};
