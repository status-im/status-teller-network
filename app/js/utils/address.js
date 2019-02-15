export function compactAddress(addr) {
  return addr.substring(0, 6) + "..." + addr.substring(38);
}

export const zeroAddress = '0x0000000000000000000000000000000000000000';
