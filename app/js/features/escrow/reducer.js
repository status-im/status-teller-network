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
          receipt: null
        }};
    case CREATE_ESCROW_SUCCEEDED:
      return {...state, ...{
          receipt: action.receipt,
          error: ''
        }};
    default:
      return state;
  }
}

export default reducer;
