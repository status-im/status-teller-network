import { APPROVE_SUCCEEDED, APPROVE_FAILED, APPROVE_PRE_SUCCEEDED, GET_SNT_ALLOWANCE_SUCCEEDED } from './constants';

const DEFAULT_STATE = {
  error: '',
  txHash: '',
  sntAllowance: null
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
    case APPROVE_PRE_SUCCEEDED:
      return {
        ...state, ...{
          error: '',
          txHash: action.txHash
        }
      };
    case APPROVE_SUCCEEDED:
      return {
        ...state,...{
          error: ''
        }
      };
    case GET_SNT_ALLOWANCE_SUCCEEDED: 
      return {
        ...state, ...{
          sntAllowance: action.allowance
        }
      };
    default:
      return state;
  }
}

export default reducer;
