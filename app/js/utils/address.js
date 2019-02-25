export function compactAddress(addr) {
  return addr.substring(0, 6) + "..." + addr.substring(38);
}

export const zeroAddress = '0x0000000000000000000000000000000000000000';

export const contactCodeRegExp = /^(0x)?[0-9a-fA-F]{130}$/;
