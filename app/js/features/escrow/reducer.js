import {
  CREATE_ESCROW_FAILED,
  CREATE_ESCROW_SUCCEEDED,
  GET_ESCROWS_SUCCEEDED,
  GET_ESCROWS_FAILED,
  GET_ESCROWS,
  RELEASE_ESCROW_SUCCEEDED,
  RELEASE_ESCROW_FAILED,
  CANCEL_ESCROW_FAILED,
  CANCEL_ESCROW_SUCCEEDED,
  RATE_TRANSACTION_FAILED,
  RATE_TRANSACTION_SUCCEEDED,
  PAY_ESCROW_SUCCEEDED,
  PAY_ESCROW_FAILED,
  OPEN_CASE_FAILED,
  OPEN_CASE_SUCCEEDED
} from './constants';

const DEFAULT_STATE = {escrows: []};

function reducer(state = DEFAULT_STATE, action) {
  let escrows  = state.escrows;
  switch (action.type) {
    case CREATE_ESCROW_FAILED:
      return {...state, ...{
          error: action.error,
          receipt: null
        }};
    case CREATE_ESCROW_SUCCEEDED:
      return {...state, ...{
          receipt: action.receipt,
          error: ''
        }};
    case GET_ESCROWS:
      return {...state, ...{
        loading: true
      }};
    case GET_ESCROWS_SUCCEEDED:
      return {...state, ...{
          escrows: action.escrows,
          loading: false
        }};
    case RELEASE_ESCROW_FAILED:
    case CANCEL_ESCROW_FAILED:
    case GET_ESCROWS_FAILED:
    case RATE_TRANSACTION_FAILED:
    case PAY_ESCROW_FAILED:
    case OPEN_CASE_FAILED:
      return {...state, ...{
          errorGet: action.error,
          loading: false
        }};
    case RELEASE_ESCROW_SUCCEEDED:
      escrows[action.escrowId].released = true;
      return {...state, ...{
          escrows: escrows,
          errorGet: ''
        }};
    case PAY_ESCROW_SUCCEEDED:
      escrows[action.escrowId].paid = true;
      return {...state, ...{
        escrows,
        errorGet: ''
      }};
    case OPEN_CASE_SUCCEEDED:
      return {...state, ...{
        escrows,
        errorGet: ''
      }};
    case CANCEL_ESCROW_SUCCEEDED:
      escrows[action.escrowId].canceled = true;
      return {...state, ...{
          escrows: escrows,
          errorGet: ''
        }};
    case RATE_TRANSACTION_SUCCEEDED:
      escrows[action.escrowId].rating = action.rating;
      return {...state, ...{
          escrows: escrows,
          errorGet: ''
        }};
    default:
      return state;
  }
}

export default reducer;
