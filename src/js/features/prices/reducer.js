import { FETCH_PRICES_SUCCEEDED, FETCH_PRICES_FAILED, SAVE_COIN_GECKO_IDS } from './constants';
import {PURGE_STATE} from '../network/constants';
import merge from "merge";

function reducer(state = {}, action) {
  switch (action.type) {
    case FETCH_PRICES_SUCCEEDED:
      return {
        ...merge.recursive(true, state, action.data),
        error: null
      };
    case FETCH_PRICES_FAILED:
      return {
        ...state,
        ...{error: action.error}
      };
    case SAVE_COIN_GECKO_IDS:
      return {
        ...state,
        coinGeckoIds: action.coinGeckoIds
      };
    case PURGE_STATE:
      return {};
    default:
      return state;
  }
}

export default reducer;
