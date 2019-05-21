import {
  BUY_LICENSE_FAILED, BUY_LICENSE, BUY_LICENSE_PRE_SUCCESS, BUY_LICENSE_CANCEL,
  BUY_LICENSE_SUCCEEDED, CHECK_LICENSE_OWNER_FAILED, CHECK_LICENSE_OWNER,
  CHECK_LICENSE_OWNER_SUCCEEDED, GET_LICENSE_OWNERS_SUCCCEDED, GET_LICENSE_OWNERS_FAILED, LOAD_PRICE_SUCCEEDED
} from './constants';
import { fromTokenDecimals } from '../../utils/numbers';
import {RESET_STATE, PURGE_STATE} from "../network/constants";

const DEFAULT_STATE = {
  licenseOwner: false,
  userRating: 0,
  price: Number.MAX_SAFE_INTEGER,
  loading: false,
  error: ''
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case BUY_LICENSE:
      return {
        ...state,
        loading: true,
        error: ''
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
        loading: false,
        error: ''
      };
    case BUY_LICENSE_CANCEL:
      return {
        ...state,
        loading: false,
        error: ''
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
    case BUY_LICENSE_FAILED:
    case CHECK_LICENSE_OWNER_FAILED:
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
    case PURGE_STATE:
    case RESET_STATE: {
      return DEFAULT_STATE;
    }
    default:
      return state;
  }
}

export default reducer;
