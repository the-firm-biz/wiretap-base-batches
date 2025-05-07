import { KernelAccountClient } from '@zerodev/sdk';
import { zeroAddress } from 'viem';

export async function initialiseSessionKey(kernelClient: KernelAccountClient) {
  const userOpHash = await kernelClient.sendUserOperation({
    calls: [{ to: zeroAddress, value: BigInt(0), data: '0x' }]
  });

  const receipt = await kernelClient.waitForUserOperationReceipt({
    hash: userOpHash
  });

  return receipt.success;
}
