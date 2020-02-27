/*global web3*/
import {
  INIT_SUCCEEDED,
  INIT_FAILED,
  UPDATE_BALANCE_SUCCEEDED,
  GET_CONTACT_CODE_SUCCEEDED,
  RESOLVE_ENS_NAME_SUCCEEDED,
  RESOLVE_ENS_NAME_FAILED,
  GET_GAS_PRICE_SUCCEEDED,
  SET_TRANSACTION_WARNING_STATE,
  SHOW_TRANSACTION_WARNING
} from './constants';
import {ENABLE_ETHEREUM_SUCCEEDED} from '../metadata/constants';
import {Networks, Tokens} from '../../utils/networks';
import {fromTokenDecimals} from '../../utils/numbers';
import {addressCompare} from '../../utils/address';

const DEFAULT_STATE = {
  ready: false,
  gasPrice: '0',
  address: '',
  contactCode: '',
  isStatus: false,
  error: '',
  network: {
    id: 0,
    name: ''
  },
  tokens: {},
  ensError: '',
  environment: 'testnet',
  acceptedTransactionWarning: null,
  showTransactionWarning: false
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
        ...state,
        ready: true,
        address: web3.eth.defaultAccount,
        isStatus: web3.currentProvider.isStatus,
        error: '',
        environment: action.environment,
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
      if (action.address && !addressCompare(action.address, state.address)) {
        return {
          ...state,
          tokens: {
            ...state.tokens,
            [action.token.symbol]: {
              ...state.tokens[action.token.symbol],
              ...action.token,
              balances: {
                ...state.tokens[action.token.symbol].balances,
                [action.address]: balance
              }
            }
          }
        };
      }
      return {
        ...state,
        tokens: {
          ...state.tokens,
          [action.token.symbol]: {
            ...state.tokens[action.token.symbol],
            ...action.token,
            balance
          }
        }
      };
    }
    case GET_GAS_PRICE_SUCCEEDED: {
      return {
        ...state,
        gasPrice: action.gasPrice
      };
    }
    case ENABLE_ETHEREUM_SUCCEEDED: {
      const result = {
        ...state
      };
      if (action.accounts && action.accounts[0]) {
        result.address = action.accounts[0];
      }
      return result;
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
    case SET_TRANSACTION_WARNING_STATE:
      return {
        ...state,
        acceptedTransactionWarning: !!action.acceptation,
        showTransactionWarning: false
      };
    case SHOW_TRANSACTION_WARNING:
      return {
        ...state,
        acceptedTransactionWarning: null,
        showTransactionWarning: true
      };
    default:
      return state;
  }
}

export default reducer;
