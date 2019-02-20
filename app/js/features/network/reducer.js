/*global web3*/
import {INIT_SUCCEEDED, INIT_FAILED, UPDATE_BALANCE_SUCCEEDED} from './constants';
import { Networks, Tokens } from '../../utils/networks';
import { fromTokenDecimals } from '../../utils/numbers';

const DEFAULT_STATE = {
  ready: false,
  address: '',
  isStatus: false,
  network: {
    id: 0,
    name: ''
  },
  tokens: {}
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case INIT_SUCCEEDED: {
      const name = Networks[action.networkId];
      const tokens = Tokens[name].reduce((acc, token) => {
        acc[token.symbol] = token;
        return acc;
      }, {});
      return {
        ready: true,
        address: web3.eth.defaultAccount,
        isStatus: web3.currentProvider.status,
        network: {
          id: action.networkId,
          name
        },
        tokens
      };
    }
    case INIT_FAILED: {
      return {
        ...state,
        ready: false,
        error: action.error
      };
    }
    case UPDATE_BALANCE_SUCCEEDED: {
      const balance = fromTokenDecimals(action.value, action.token.decimals);
      return {
        ...state, tokens: { ...state.tokens, [action.token.symbol]: {...action.token, balance} }
      };
    }
    default:
      return state;
  }
}

export default reducer;
