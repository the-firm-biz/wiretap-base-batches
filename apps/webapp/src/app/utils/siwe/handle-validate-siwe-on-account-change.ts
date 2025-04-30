import { Address } from 'viem';
import {
  getDecodedSiweAccountCookie,
  setSiweSessionCookie
} from './siwe-cookies';
import { siweConfig } from './siwe-config';

interface HandleValidateSiweOnAccountChangeArgs {
  newAddress: Address;
  openAppKitModal: () => void;
  closeAppKitModal: () => void;
}

/**
 * On account change
 * 1. Check if the new address has a SIWE account cookie
 * 2. If it does, verify the message
 * 3. If the message is valid, set the SIWE session cookie
 * 4. If the message is invalid, sign out.
 */
export const handleValidateSiweOnAccountChange = async ({
  newAddress,
  openAppKitModal,
  closeAppKitModal
}: HandleValidateSiweOnAccountChangeArgs) => {
  const newAddressSiweCookie = getDecodedSiweAccountCookie(newAddress);
  if (!newAddressSiweCookie) {
    console.log('siwe: || !newAddressSiweCookie for', newAddress);
    openAppKitModal();
    return;
  }

  const isMessageValid = await siweConfig.verifyMessage({
    message: newAddressSiweCookie.message,
    signature: newAddressSiweCookie.signature
  });

  if (!isMessageValid) {
    console.log('siwe: || !isMessageValid for', newAddress);
    await siweConfig.signOut();
  }

  console.log('siwe: || setSiweSessionCookie for', newAddress);
  setSiweSessionCookie(newAddress);
};
