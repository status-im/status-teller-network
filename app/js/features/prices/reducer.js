import { FETCH_PRICES_SUCCEEDED } from './constants';

function reducer(state = {}, action) {
  switch (action.type) {
  case FETCH_PRICES_SUCCEEDED:
    return {
      ...state,
      ...action.data
    };
  default:
    return state;
  }
}

export default reducer;

export const getEthUsdPrice = state => state.prices.ETH.USD;
export const getSntUsdPrice = state => state.prices.SNT.USD;
