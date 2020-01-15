export const getPrices = state => state.prices;

export const getAssetPrice = (state, assetSymbol) => {
  if (!assetSymbol) {
    return null;
  }
  return state.prices[assetSymbol];
};

export const hasPrices = state => {
  return state.prices !== undefined;
};

export const getGeckoIds = state => state.prices.coinGeckoIds;

export const error = state => state.prices.error;
