/* global web3 */

export const States = {
  none: 'none',
  pending: 'pending',
  success: 'success',
  failed: 'failed'
};

export const calculateEscrowPrice = (escrow, prices) => {
  return prices[escrow.token.symbol][escrow.currency] * ((100 + (parseFloat(escrow.margin))) / 100);
};

const toBN = web3.utils.toBN;

export const checkNotEnoughETH = (gasPrice, ethBalance) => {
  const relayGasPrice = toBN(gasPrice || '0').mul(toBN(120)).div(toBN(100)); // 120%. toBN doesnt like decimals?
  return toBN(web3.utils.toWei(ethBalance || '0', 'ether')).lt(toBN(500000).mul(relayGasPrice)); // only allow ETH if less than 500000*gasPrice
};

export const filterValidGaslessOffers = (offers, noBalance) => {
  return noBalance ? offers.filter(x => x.token.symbol === 'ETH') : offers;
};

export const remove_e_prefix = (escrow) => {
  const result = {};
  Object.keys(escrow).forEach(x => {
    result[x.replace(/^e_/, '')] = escrow[x];
  });
  return result;
};
