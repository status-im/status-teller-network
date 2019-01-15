export function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

export function toInputDate(date) {
  return date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate()) +
    'T' + pad(date.getUTCHours()) +
    ':' + pad(date.getUTCMinutes());
}

export function compactAddress(addr) {
  return addr.substring(0, 6) + "..." + addr.substring(38);
}
