import {
  INCLUDE_SIGNATURE_SUCCEEDED,
  INCLUDE_SIGNATURE_FAILED
} from './constants';

const DEFAULT_STATE = {message: null, type: null, escrowId: null};

function reducer(state = DEFAULT_STATE, action) {
 switch (action.type) {
    case INCLUDE_SIGNATURE_FAILED:
      return {...state, ...{
          error: action.error,
          receipt: null
        }};
    case INCLUDE_SIGNATURE_SUCCEEDED:
      return {...state, ...{
          receipt: action.receipt,
          error: ''
        }};
    default:
      return state;
  }
}

export default reducer;
