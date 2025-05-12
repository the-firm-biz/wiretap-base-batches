import { Basename } from '@wiretap/utils/shared';
import { Address } from 'viem';

type LabelOptions = {
  socialName?: string;
  basename?: Basename;
  evmAddress?: Address;
  socialUsername?: string;
};

export const constructLabel = ({
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
