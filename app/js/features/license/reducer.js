import {
  BUY_LICENSE_FAILED, BUY_LICENSE, BUY_LICENSE_PRE_SUCCESS,
  BUY_LICENSE_SUCCEEDED, CHECK_LICENSE_OWNER_FAILED, CHECK_LICENSE_OWNER,
  CHECK_LICENSE_OWNER_SUCCEEDED, USER_RATING_FAILED,
  USER_RATING_SUCCEEDED, GET_LICENSE_OWNERS_SUCCCEDED, GET_LICENSE_OWNERS_FAILED, LOAD_PRICE_SUCCEEDED
} from './constants';
import { fromTokenDecimals } from '../../utils/numbers';

const DEFAULT_STATE = {
  licenseOwner: false,
  userRating: 0,
  price: Number.MAX_SAFE_INTEGER
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case BUY_LICENSE:
      return {
        ...state, 
        loading: true
      };
    case BUY_LICENSE_PRE_SUCCESS:
      return {
        ...state,
        txHash: action.txHash
      };
    case BUY_LICENSE_SUCCEEDED:
      return {
        ...state, 
        licenseOwner: true,
        loading: false
      };
    case LOAD_PRICE_SUCCEEDED:
      return {
        ...state,
        price: fromTokenDecimals(action.price, 18)
      };
    case CHECK_LICENSE_OWNER:
      return {
        ...state, licenseOwner: false
      };
    case CHECK_LICENSE_OWNER_SUCCEEDED:
      return {
        ...state, licenseOwner: action.isLicenseOwner
      };
    case GET_LICENSE_OWNERS_SUCCCEDED:
      return {
        ...state, licenseOwners: action.licenseOwners
      };
    case USER_RATING_SUCCEEDED:
      return {
        ...state,
        userRating: action.userRating
      };
    case BUY_LICENSE_FAILED:
    case CHECK_LICENSE_OWNER_FAILED:
    case USER_RATING_FAILED:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    case GET_LICENSE_OWNERS_FAILED:
      return {
        ...state,
        licenseOwnersError: action.error
      };
    default:
      return state;
  }
}

export default reducer;
