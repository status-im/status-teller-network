import {
  BUY_LICENSE_SUCCEEDED,
  CHECK_LICENSE_OWNER_SUCCEEDED
} from './constants';

const DEFAULT_STATE = {
  licenseOwner: false
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case BUY_LICENSE_SUCCEEDED:
      return {
        licenseOwner: true
      };
    case CHECK_LICENSE_OWNER_SUCCEEDED:
      return {
        licenseOwner: action.isLicenseOwner
      };
    default:
      return state;
  }
}

export default reducer;
