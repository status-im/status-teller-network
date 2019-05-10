export const getPrices = state => state.prices;

export const hasPrices = state => {
  return state.prices.ETH !== undefined;
};
