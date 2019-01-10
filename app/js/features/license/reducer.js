import {
  BUY_LICENSE_FAILED,
  BUY_LICENSE_SUCCEEDED, CHECK_LICENSE_OWNER_FAILED,
  CHECK_LICENSE_OWNER_SUCCEEDED, USER_RATING_FAILED,
  USER_RATING_SUCCEEDED, GET_LICENSE_OWNERS_SUCCCEDED, GET_LICENSE_OWNERS_FAILED
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
    case GET_LICENSE_OWNERS_SUCCCEDED:
      return {...state, ...{
        licenseOwners: action.licenseOwners
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
    case GET_LICENSE_OWNERS_FAILED:
      return {...state, ...{
        licenseOwnersError: action.error
      }};
    default:
      return state;
  }
}

export default reducer;
