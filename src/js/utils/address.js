/* global web3 */
import { ec } from 'elliptic';

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

const EC = new ec('secp256k1');

export const generateXY = (pub) => {
  const stripped = pub.slice(2);
  const key = EC.keyFromPublic(stripped, 'hex');
  const pubPoint = key.getPublic();
  const x = '0x' + pubPoint.getX().toString(16, 64);
  const y = '0x'+ pubPoint.getY().toString(16, 64);
  return { x, y };
};

export const keyFromXY = (X, Y) => {
  if(X === zeroBytes && Y === zeroBytes) return "";

  const x = Buffer.from(X.substring(2), 'hex');
  const y = Buffer.from(Y.substring(2), 'hex');
  const keys = EC.keyFromPublic({ x, y }, 'hex');
  return `0x${keys.getPublic().encode('hex')}`;
};
