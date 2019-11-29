/* global web3 */

export function compactAddress(addr, numberOfChars) {

  if(addr.length <= 5 + (numberOfChars * 2)){  //   5 represents these chars 0x...
    return addr;
  }

  return addr.substring(0, 2 + numberOfChars) + "..." + addr.substring(addr.length - numberOfChars);
}

export const zeroAddress = '0x0000000000000000000000000000000000000000';

export const zeroBytes = zeroAddress + '000000000000000000000000';

export const contactCodeRegExp = /^0x[0-9a-fA-F]{130}$/;

export const toChecksumAddress = (address) => {
  return web3.utils.toChecksumAddress(address);
};

export const addressCompare = (address1, address2) => {
  if(!address1 || !address2) return false;
  return toChecksumAddress(address1) === toChecksumAddress(address2);
};
