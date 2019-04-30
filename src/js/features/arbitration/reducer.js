import {
  GET_DISPUTED_ESCROWS_SUCCEEDED,
  GET_DISPUTED_ESCROWS_FAILED,
  GET_DISPUTED_ESCROWS,
  RESOLVE_DISPUTE,
  RESOLVE_DISPUTE_PRE_SUCCESS,
  RESOLVE_DISPUTE_SUCCEEDED,
  RESOLVE_DISPUTE_FAILED,
  LOAD_ARBITRATION_SUCCEEDED,
  GET_ARBITRATORS_FAILED,
  GET_ARBITRATORS_SUCCEEDED,
  OPEN_DISPUTE_FAILED,
  OPEN_DISPUTE,
  OPEN_DISPUTE_SUCCEEDED,
  OPEN_DISPUTE_PRE_SUCCESS
} from './constants';

const DEFAULT_STATE = {escrows: [], arbitration: null, arbitrators: [], receipt: null};

function reducer(state = DEFAULT_STATE, action) {
  let escrows = state.escrows;
  switch (action.type) {
    case GET_DISPUTED_ESCROWS:
      return {
        ...state, ...{
          loading: true,
          receipt: null
        }
      };
    case OPEN_DISPUTE_PRE_SUCCESS:
    case RESOLVE_DISPUTE_PRE_SUCCESS:
      return {
        ...state, ...{
          txHash: action.txHash
        }
      };
    case GET_DISPUTED_ESCROWS_SUCCEEDED:
      return {
        ...state, ...{
          escrows: action.escrows,
          loading: false
        }
      };
    case OPEN_DISPUTE_SUCCEEDED: 
      return {
        ...state,
        loading: false,
        receipt: action.receipt
      };
    case OPEN_DISPUTE_FAILED:
    case GET_DISPUTED_ESCROWS_FAILED:
    case RESOLVE_DISPUTE_FAILED:
    case GET_ARBITRATORS_FAILED:
      return {
        ...state, ...{
          errorGet: action.error,
          loading: false
        }
      };
    case OPEN_DISPUTE:
    case RESOLVE_DISPUTE:
      return {
        ...state, ...{
          loading: true
        }
      };
    case RESOLVE_DISPUTE_SUCCEEDED:
      return {
        ...state, ...{
          escrows,
          errorGet: '',
          loading: false
        }
      };
    case LOAD_ARBITRATION_SUCCEEDED: 
      return {
        ...state,
        arbitration: action.escrow
      };
    case GET_ARBITRATORS_SUCCEEDED:
      return {
        ...state,
        arbitrators: action.arbitrators
      };
    default:
      return state;
  }
}

export default reducer;
