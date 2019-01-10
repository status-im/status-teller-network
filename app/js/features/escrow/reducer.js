import {CREATE_ESCROW, CREATE_ESCROW_FAILED, CREATE_ESCROW_SUCCEEDED} from './constants';

const DEFAULT_STATE = {
  licenseOwner: false,
  userRating: 0
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default reducer;
