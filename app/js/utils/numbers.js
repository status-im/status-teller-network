import BN from 'bn.js';
import numberToBN from 'number-to-bn';

const padLeft = (number, length) => {
  var str = String(number);
  while (str.length < length) {
      str = '0' + str;
  }
  return str;
};

export const addDecimals = (value, decimals) => {
  const pow = new BN(10, 10).pow(numberToBN(decimals));
  const res = pow * value;
  return Math.floor(res).toString(10);
};

export const fromTokenDecimals = (value, decimals) => {
  value = new BN(value, 10);
  const pow = new BN(10, 10).pow(numberToBN(decimals));
  const int = value.div(pow);
  const dec = padLeft(value.mod(pow).toString(10), decimals).replace(/0+$/, '');
  return int.toString(10) + (dec !== "" ? "." + dec : "");
};

export function formatBalance(balance) {
  balance = parseFloat(balance);
  if (!balance) {
    return '0';
  }
  if (balance > 99999) {
    return '99999+';
  }
  return parseFloat(balance.toFixed(6)).toString();
}

