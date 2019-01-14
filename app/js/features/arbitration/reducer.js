import {
  GET_DISPUTED_ESCROWS_SUCCEEDED,
  GET_DISPUTED_ESCROWS_FAILED,
  GET_DISPUTED_ESCROWS,
  RESOLVE_DISPUTE_SUCCEEDED,
  RESOLVE_DISPUTE_FAILED
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
    case RESOLVE_DISPUTE_FAILED:
      return {...state, ...{
          errorGet: action.error,
          loading: false
        }};
    case RESOLVE_DISPUTE_SUCCEEDED:
      return {...state, ...{
        escrows,
        errorGet: ''
      }};
    default:
      return state;
  }
}

export default reducer;
