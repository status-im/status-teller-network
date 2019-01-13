import {
  GET_DISPUTED_ESCROWS_SUCCEEDED,
  GET_DISPUTED_ESCROWS_FAILED,
  GET_DISPUTED_ESCROWS,
  PAY_ESCROW_SUCCEEDED,
  PAY_ESCROW_FAILED
} from './constants';

const DEFAULT_STATE = {escrows: []};

function reducer(state = DEFAULT_STATE, action) {
  let escrows  = state.escrows;
  switch (action.type) {
    case GET_DISPUTED_ESCROWS:
      return {...state, ...{
        loading: true
      }};
    case GET_DISPUTED_ESCROWS_SUCCEEDED:
      return {...state, ...{
          escrows: action.escrows,
          loading: false
        }};
    case GET_DISPUTED_ESCROWS_FAILED:
    case PAY_ESCROW_FAILED:
      return {...state, ...{
          errorGet: action.error,
          loading: false
        }};
    case PAY_ESCROW_SUCCEEDED:
      escrows[action.escrowId].paid = true;
      return {...state, ...{
        escrows,
        errorGet: ''
      }};
    default:
      return state;
  }
}

export default reducer;
