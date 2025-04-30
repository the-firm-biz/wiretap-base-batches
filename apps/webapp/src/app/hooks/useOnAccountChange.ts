import { useEffect } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { usePreviousValue } from './usePreviousValue';

type AnyCallback = (address: Address, previousAddress?: string) => any;

export const useOnAccountChange = (callback: AnyCallback) => {
  const { address } = useAccount();
  const previousAddress = usePreviousValue(address);

  useEffect(() => {
    if (address && address !== previousAddress) {
      callback(address, previousAddress);
    }
  }, [previousAddress, address, callback]);
};
