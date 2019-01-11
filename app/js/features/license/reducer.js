import {
  BUY_LICENSE_FAILED,
  BUY_LICENSE_SUCCEEDED, CHECK_LICENSE_OWNER_FAILED,
  CHECK_LICENSE_OWNER_SUCCEEDED, USER_RATING_FAILED,
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
    case BUY_LICENSE_FAILED:
    case CHECK_LICENSE_OWNER_FAILED:
    case USER_RATING_FAILED:
      return {...state, ...{
        error: action.error
      }};
    default:
      return state;
  }
}

export default reducer;
