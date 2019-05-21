import {
  INCLUDE_SIGNATURE,
  INCLUDE_SIGNATURE_PRE_SUCCESS,
  INCLUDE_SIGNATURE_SUCCEEDED,
  INCLUDE_SIGNATURE_FAILED
} from './constants';
import {RESET_STATE, PURGE_STATE} from "../network/constants";

const DEFAULT_STATE = {message: null, type: null, escrowId: null, loading: false};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case INCLUDE_SIGNATURE:
      return {
        ...state, ...{
          loading: true
        }
      };
    case INCLUDE_SIGNATURE_PRE_SUCCESS:
      return {
        ...state, ...{
          txHash: action.txHash
        }
      };
    case INCLUDE_SIGNATURE_FAILED:
      return {
        ...state, ...{
          error: action.error,
          receipt: null,
          loading: false
        }
      };
    case INCLUDE_SIGNATURE_SUCCEEDED:
      return {
        ...state, ...{
          receipt: action.receipt,
          error: '',
          loading: false
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
