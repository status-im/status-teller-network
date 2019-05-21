/*global web3*/
import { INIT_SUCCEEDED, INIT_FAILED, UPDATE_BALANCE_SUCCEEDED, GET_CONTACT_CODE_SUCCEEDED, RESOLVE_ENS_NAME_SUCCEEDED, RESOLVE_ENS_NAME_FAILED } from './constants';
import { Networks, Tokens } from '../../utils/networks';
import { fromTokenDecimals } from '../../utils/numbers';

const DEFAULT_STATE = {
  ready: false,
  address: '',
  contactCode: '',
  isStatus: false,
  error: '',
  network: {
    id: 0,
    name: ''
  },
  tokens: {},
  ensError: ''
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case INIT_SUCCEEDED: {
      const name = Networks[action.networkId] || 'unknown';
      const tokens = Tokens[name].reduce((acc, token) => {
        acc[token.symbol] = token;
        return acc;
      }, {});
      return {
        ready: true,
        address: web3.eth.defaultAccount,
        isStatus: web3.currentProvider.isStatus,
        error: '',
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
      if (action.address && action.address !== state.address) {
        return {
          ...state, tokens: {
            ...state.tokens, [action.token.symbol]: {
              ...action.token, balances: {...state.tokens[action.token.symbol].balances, [action.address]: balance}
            }
          }
        };
      }
      return {
        ...state, tokens: { ...state.tokens, [action.token.symbol]: {...action.token, balance} }
      };
    }
    case GET_CONTACT_CODE_SUCCEEDED: {
      return {
        ...state,
        contactCode: action.contactCode
      };
    }
    case RESOLVE_ENS_NAME_SUCCEEDED: {
      return {
        ...state,
        ensError: '',
        contactCode: action.contactCode
      };
    }
    case RESOLVE_ENS_NAME_FAILED: {
      return {
        ...state,
        ensError: action.error
      };
    }
    default:
      return state;
  }
}

export default reducer;
