import {
  UPDATE_BALANCE_SUCCEEDED
} from './constants';
import { fromTokenDecimals } from '../../utils/numbers';

const DEFAULT_STATE = {};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case UPDATE_BALANCE_SUCCEEDED: {
      const balance = fromTokenDecimals(action.value, action.token.decimals);
      return {
        ...state, [action.token.symbol]: {...action.token, balance}
      };
    }
    default:
      return state;
  }
}

export default reducer;
