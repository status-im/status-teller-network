import { APPROVE_SUCCEEDED, APPROVE_FAILED, APPROVE_PRE_SUCCEEDED, GET_SNT_ALLOWANCE_SUCCEEDED, GET_TOKEN_ALLOWANCE_SUCCEEDED, CANCEL_APPROVE_TOKEN} from './constants';
import {RESET_STATE, PURGE_STATE} from "../network/constants";

const DEFAULT_STATE = {
  error: '',
  txHash: '',
  sntAllowance: null,
  tokenAllowance: null,
  loading: false
};

// eslint-disable-next-line complexity
function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case APPROVE_FAILED:
      return {
        ...state, ...{
          error: action.error,
          txHash: ''
        }
      };
    case CANCEL_APPROVE_TOKEN:
      return {
        ...state, ...{
          error: '',
          txHash: '',
          loading: false
        }
      };
    case APPROVE_PRE_SUCCEEDED:
      return {
        ...state, ...{
          error: '',
          txHash: action.txHash,
          loading: true
        }
      };
    case APPROVE_SUCCEEDED:
      return {
        ...state,...{
          error: '',
          loading: false
        }
      };
    case GET_SNT_ALLOWANCE_SUCCEEDED:
      return {
        ...state, ...{
          sntAllowance: action.allowance
        }
      };
    case GET_TOKEN_ALLOWANCE_SUCCEEDED:
      return {
        ...state, ...{
          tokenAllowance: action.allowance
        }
      };
    case PURGE_STATE:
    case RESET_STATE: {
      return DEFAULT_STATE;
    }
    default:
      return state;
  }
}

export default reducer;
