/* eslint-disable complexity */

import {
  GET_DISPUTED_ESCROWS_SUCCEEDED,
  GET_DISPUTED_ESCROWS_FAILED,
  GET_DISPUTED_ESCROWS,
  RESOLVE_DISPUTE,
  RESOLVE_DISPUTE_PRE_SUCCESS,
  RESOLVE_DISPUTE_SUCCEEDED,
  RESOLVE_DISPUTE_FAILED,
  LOAD_ARBITRATION_SUCCEEDED,
  GET_ARBITRATORS_FAILED,
  GET_ARBITRATORS_SUCCEEDED,
  CANCEL_DISPUTE_FAILED,
  CANCEL_DISPUTE,
  CANCEL_DISPUTE_SUCCEEDED,
  CANCEL_DISPUTE_PRE_SUCCESS,
  OPEN_DISPUTE_FAILED,
  OPEN_DISPUTE,
  OPEN_DISPUTE_SUCCEEDED,
  OPEN_DISPUTE_PRE_SUCCESS,
  BUY_LICENSE,
  BUY_LICENSE_FAILED,
  BUY_LICENSE_PRE_SUCCESS,
  BUY_LICENSE_SUCCEEDED,
  BUY_LICENSE_CANCEL,
  LOAD_PRICE_SUCCEEDED,
  CHECK_LICENSE_OWNER_FAILED,
  CHECK_LICENSE_OWNER_SUCCEEDED,
  ARBITRATION_UNSOLVED
} from './constants';
import { fromTokenDecimals } from '../../utils/numbers';
import {RESET_STATE, PURGE_STATE} from "../network/constants";
import {toChecksumAddress, zeroAddress} from '../../utils/address';

const DEFAULT_STATE = {
  escrows: [], arbitration: null, arbitrators: [], licenseOwner: false,
  receipt: null,
  price: Number.MAX_SAFE_INTEGER,
  loading: false,
  error: ''
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case GET_DISPUTED_ESCROWS:
      return {
        ...state, ...{
          loading: true,
          receipt: null
        }
      };
    case CANCEL_DISPUTE_PRE_SUCCESS:
    case OPEN_DISPUTE_PRE_SUCCESS:
    case RESOLVE_DISPUTE_PRE_SUCCESS:
      return {
        ...state, ...{
          txHash: action.txHash
        }
      };
    case GET_DISPUTED_ESCROWS_SUCCEEDED:
      return {
        ...state, ...{
          escrows: action.escrows,
          loading: false
        }
      };
    case CANCEL_DISPUTE_SUCCEEDED:
      return {
        ...state, ...{
          arbitration: {
            ...state.arbitration,
            arbitration: {
              open: false,
              openBy: zeroAddress,
              arbitrator: zeroAddress,
              result: ARBITRATION_UNSOLVED
            }
          },
          loading: false,
          receipt: action.receipt
        }
      };
    case OPEN_DISPUTE_SUCCEEDED:
      return {
        ...state,
        loading: false,
        receipt: action.receipt
      };
    case CANCEL_DISPUTE_FAILED:
    case OPEN_DISPUTE_FAILED:
    case GET_DISPUTED_ESCROWS_FAILED:
    case RESOLVE_DISPUTE_FAILED:
    case GET_ARBITRATORS_FAILED:
      return {
        ...state, ...{
          errorGet: action.error,
          loading: false
        }
      };
    case CANCEL_DISPUTE:
    case OPEN_DISPUTE:
    case RESOLVE_DISPUTE:
      return {
        ...state, ...{
          loading: true
        }
      };
    case RESOLVE_DISPUTE_SUCCEEDED:
    {
      const escrowsClone = [...state.escrows];
      return {
        ...state, ...{
          escrows: escrowsClone,
          arbitration: {
            ...state.arbitration,
            arbitration: {
              ...state.arbitration.arbitration,
              open: false,
              result: action.result
            }
          },
          errorGet: '',
          loading: false
        }
      };
    }
    case LOAD_ARBITRATION_SUCCEEDED:
      return {
        ...state,
        arbitration: action.escrow
      };
    case GET_ARBITRATORS_SUCCEEDED:
      return {
        ...state,
        arbitrators: action.arbitrators.map(arbitratorAddr => toChecksumAddress(arbitratorAddr))
      };
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
    case CHECK_LICENSE_OWNER_SUCCEEDED:
      return {
        ...state, licenseOwner: action.isLicenseOwner
      };
    case BUY_LICENSE_FAILED:
    case CHECK_LICENSE_OWNER_FAILED:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    case RESET_STATE: {
      return Object.assign({}, state, {
        arbitration: null,
        licenseOwner: false,
        receipt: null,
        loading: false,
        error: ''
      });
    }
    case PURGE_STATE:
      return DEFAULT_STATE;
    default:
      return state;
  }
}

export default reducer;
