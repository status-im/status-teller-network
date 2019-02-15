export const getTokensWithPositiveBalance = (state) => {
  return Object.values(state.balances).filter((token) => token.balance > 0);
};

export const getTokenBySymbol = (state, symbol) => {
  return state.balances[symbol];
};
