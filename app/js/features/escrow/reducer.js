import {CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED} from './constants';

const DEFAULT_STATE = {
  licenseOwner: false,
  userRating: 0
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case CREATE_ESCROW_FAILED:
      return {...state, ...{
          error: action.error,
          result: null
        }};
    case CREATE_ESCROW_SUCCEEDED:
      return {...state, ...{
          result: action.result,
          error: ''
        }};
    default:
      return state;
  }
}

export default reducer;
