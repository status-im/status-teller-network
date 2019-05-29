/*global web3*/
import BN from 'bn.js';
import numberToBN from 'number-to-bn';

export const truncateTwo = (num) => {
  const re = new RegExp('^-?\\d+(?:.\\d{0,' + (2 || -1) + '})?');
  num = Number(num.toString().match(re)[0]);
  return Number(Math.round(num + "e+2")  + "e-2");
};

const padLeft = (number, length) => {
  let str = String(number);
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


const padRight = (number, length) => {
  let str = String(number);
  while (str.length < length) {
    str += '0';
  }
  return str;
};

export const toTokenDecimals = (value, decimals) => {
  value = value.toString().split('.');
  const pow = new BN(10, 10).pow(numberToBN(decimals));
  const int = numberToBN(value[0]).mul(pow);
  const dec = numberToBN(padRight(value.length > 1 ? value[1] : 0, decimals));
  if (dec.toString(10).length > pow.toString(10).length) throw new Error('Too many decimal places');
  return int.add(dec).toString(10);
};

export const fromTokenDecimals = (value, decimals = 18) => {
  value = new BN(value, 10);
  const pow = new BN(10, 10).pow(numberToBN(decimals));
  const int = value.div(pow);
  const dec = padLeft(value.mod(pow).toString(10), decimals).replace(/0+$/, '');
  return int.toString(10) + (dec !== "" ? "." + dec : "");
};

export function formatBalance(balance) {
  let numericalBalance = parseFloat(balance);
  if (!numericalBalance) {
    return '0';
  }
  if (numericalBalance > 99999) {
    return '99,999+';
  }

  if (numericalBalance < 0.000001) {
    balance = web3.utils.toWei(balance);
    if (balance.length > 6) {
      return parseFloat(web3.utils.fromWei(balance, 'Gwei').substring(0, 7)).toLocaleString() + ' Gwei';
    }
    return balance + ' wei';
  }

  return parseFloat(numericalBalance.toFixed(6)).toString();
}

