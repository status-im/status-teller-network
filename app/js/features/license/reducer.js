import {
  BUY_LICENSE_SUCCEEDED,
  CHECK_LICENSE_OWNER_SUCCEEDED,
  USER_RATING_SUCCEEDED
} from './constants';

const DEFAULT_STATE = {
  licenseOwner: false,
  userRating: 0
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case BUY_LICENSE_SUCCEEDED:
      return {...state, ...{
        licenseOwner: true
      }};
    case CHECK_LICENSE_OWNER_SUCCEEDED:
      return {...state, ...{
        licenseOwner: action.isLicenseOwner
      }};
    case USER_RATING_SUCCEEDED:
      return {...state, ...{
        userRating: action.userRating
      }};
    default:
      return state;
  }
}

export default reducer;
