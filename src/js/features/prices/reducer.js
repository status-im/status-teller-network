import { FETCH_PRICES_SUCCEEDED, FETCH_PRICES_FAILED } from './constants';

function reducer(state = {}, action) {
  switch (action.type) {
  case FETCH_PRICES_SUCCEEDED:
    return {
      ...state,
      ...action.data
    };
  case FETCH_PRICES_FAILED:
    return {
      ...state,
      ...{error: action.error}
    };
  default:
    return state;
  }
}

export default reducer;

export const getEthUsdPrice = state => state.prices.ETH && state.prices.ETH.USD;
export const getSntUsdPrice = state => state.prices.SNT && state.prices.SNT.USD;
export const hasPricesError = state => !!state.prices.error;
