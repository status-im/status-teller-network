import {CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED, GET_ESCROWS_SUCCEEDED, GET_ESCROWS_FAILED,
RELEASE_ESCROW_SUCCEEDED, RELEASE_ESCROW_FAILED} from './constants';

const DEFAULT_STATE = {};

function reducer(state = DEFAULT_STATE, action) {
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
    case GET_ESCROWS_SUCCEEDED:
      return {...state, ...{
          escrows: action.escrows
        }};
    case RELEASE_ESCROW_FAILED:
    case GET_ESCROWS_FAILED:
      return {...state, ...{
          errorGet: action.error
        }};
    case RELEASE_ESCROW_SUCCEEDED:
      const escrows = state.escrows;
      escrows[action.escrowId].released = true;
      return {...state, ...{
          escrows: escrows
        }};
    default:
      return state;
  }
}

export default reducer;
