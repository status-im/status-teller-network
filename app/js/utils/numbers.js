import BN from 'bn.js';
import numberToBN from 'number-to-bn';

const padLeft = (number, length) => {
  var str = String(number);
  while (str.length < length) {
      str = '0' + str;
  }
  return str;
};

export const fromTokenDecimals = (value, decimals) => {
  value = new BN(value, 10);
  const pow = new BN(10, 10).pow(numberToBN(decimals));
  const int = value.div(pow);
  const dec = padLeft(value.mod(pow).toString(10), decimals).replace(/0+$/, '');
  return int.toString(10) + (dec !== "" ? "." + dec : "");
};

