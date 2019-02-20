export const isReady = state => state.network.ready;
export const error = state => state.network.error;
export const errorTip = state => {
  if (!state.network.error) {
    return '';
  }
  if (state.network.error.indexOf('Provider') > -1) {
    return 'You browser doesn\'t support web3 standards. Try using a different browser';
  }
  return '';
};
export const getAddress = state => state.network.address;
export const isStatus = state => state.network.isStatus;
export const getTokens = state => state.network.tokens;
export const getTokensWithPositiveBalance = (state) => (
  Object.values(state.network.tokens).filter((token) => token.balance > 0)
);
export const getTokenBySymbol = (state, symbol) => state.network.tokens[symbol];
export const getTokenByAddress = (state, address) => {
  const symbol = Object.keys(state.network.tokens)
                       .find(token => state.network.tokens[token].address === address);
  return state.network.tokens[symbol];
};
