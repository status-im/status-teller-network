/* eslint-disable complexity */
/*global web3*/

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
  ARBITRATION_UNSOLVED,
  REQUEST_ARBITRATOR_PRE_SUCCESS,
  REQUEST_ARBITRATOR_SUCCEEDED,
  REQUEST_ARBITRATOR_FAILED,
  REQUEST_ARBITRATOR,
  CANCEL_ARBITRATOR_SELECTION_ACTIONS,
  AWAIT,
  CANCEL_ARBITRATOR_REQUEST_PRE_SUCCESS,
  CANCEL_ARBITRATOR_REQUEST_FAILED,
  CANCEL_ARBITRATOR_REQUEST_SUCCEEDED,
  CLOSED,
  CHANGE_ACCEPT_EVERYONE,
  CHANGE_ACCEPT_EVERYONE_PRE_SUCCESS,
  CHANGE_ACCEPT_EVERYONE_FAILED,
  CHANGE_ACCEPT_EVERYONE_SUCCEEDED,
  GET_ARBITRATION_REQUESTS_SUCCEEDED,
  GET_ARBITRATION_REQUESTS_FAILED,
  ACCEPT_ARBITRATOR_REQUEST,
  ACCEPT_ARBITRATOR_REQUEST_PRE_SUCCESS,
  ACCEPT_ARBITRATOR_REQUEST_FAILED,
  ACCEPT_ARBITRATOR_REQUEST_SUCCEEDED,
  REJECT_ARBITRATOR_REQUEST_PRE_SUCCESS,
  REJECT_ARBITRATOR_REQUEST_FAILED,
  REJECT_ARBITRATOR_REQUEST,
  REJECT_ARBITRATOR_REQUEST_SUCCEEDED,
  REJECTED,
  ACCEPTED,
  GET_BLACKLISTED_SELLERS_SUCCEEDED, GET_BLACKLISTED_SELLERS_FAILED,
  BLACKLIST_SELLER_SUCCEEDED, UNBLACKLIST_SELLER_SUCCEEDED,
  RESET_ARBITRATOR_SCORES, ADD_ARBITRATOR_SCORE, GET_FALLBACK_ARBITRATOR_FAILED, GET_FALLBACK_ARBITRATOR_SUCCEEDED, IS_FALLBACK_ARBITRATOR_FAILED, IS_FALLBACK_ARBITRATOR_SUCCEEDED
} from './constants';
import { fromTokenDecimals } from '../../utils/numbers';
import {RESET_STATE, PURGE_STATE} from "../network/constants";
import {toChecksumAddress, zeroAddress} from '../../utils/address';

const DEFAULT_STATE = {
  escrows: [], arbitration: null, arbitrators: {}, licenseOwner: false, acceptAny: false,
  receipt: null,
  price: Number.MAX_SAFE_INTEGER,
  loading: false,
  error: '',
  arbitratorRequests: [],
  blacklistedSellers: [],
  arbitratorScores: {},
  fallbackArbitrator: '',
  actionNeeded: 0,
  isFallbackArbitrator: false
};

function nbActionNeeded(escrows) {
  const defaultAccount = web3.eth.defaultAccount;
  let nbActionNeeded = 0;
  // Check the trade status to see if there are actions needed
  Object.values(escrows).forEach(escrow => {
    if (toChecksumAddress(defaultAccount) !== toChecksumAddress(escrow.arbitration.arbitrator)) {
      return false;
    }
    nbActionNeeded += escrow.arbitration.open ? 1 : 0;
  });
  return nbActionNeeded;
}

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
    case REQUEST_ARBITRATOR_PRE_SUCCESS:
    case CANCEL_ARBITRATOR_REQUEST_PRE_SUCCESS:
    case CHANGE_ACCEPT_EVERYONE_PRE_SUCCESS:
    case ACCEPT_ARBITRATOR_REQUEST_PRE_SUCCESS:
    case REJECT_ARBITRATOR_REQUEST_PRE_SUCCESS:
      return {
        ...state, ...{
          txHash: action.txHash
        }
      };
    case GET_DISPUTED_ESCROWS_SUCCEEDED:
      return {
        ...state, ...{
          escrows: action.escrows,
          loading: false,
          actionNeeded: nbActionNeeded(action.escrows)
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
    case GET_FALLBACK_ARBITRATOR_FAILED:
    case REQUEST_ARBITRATOR_FAILED:
    case CANCEL_ARBITRATOR_REQUEST_FAILED:
    case CHANGE_ACCEPT_EVERYONE_FAILED:
    case GET_ARBITRATION_REQUESTS_FAILED:
    case ACCEPT_ARBITRATOR_REQUEST_FAILED:
    case REJECT_ARBITRATOR_REQUEST_FAILED:
    case GET_BLACKLISTED_SELLERS_FAILED:
    case IS_FALLBACK_ARBITRATOR_FAILED:
      return {
        ...state, ...{
          errorGet: action.error,
          loading: false
        }
      };
    case REQUEST_ARBITRATOR:
    case CANCEL_DISPUTE:
    case OPEN_DISPUTE:
    case RESOLVE_DISPUTE:
    case CHANGE_ACCEPT_EVERYONE:
    case ACCEPT_ARBITRATOR_REQUEST:
    case REJECT_ARBITRATOR_REQUEST:
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
        },
        actionNeeded: nbActionNeeded(escrowsClone)
      };
    }
    case LOAD_ARBITRATION_SUCCEEDED:
      return {
        ...state,
        arbitration: action.escrow
      };
    case GET_FALLBACK_ARBITRATOR_SUCCEEDED:
      return {
        ...state,
        fallbackArbitrator: action.fallbackArbitrator
      };
    case IS_FALLBACK_ARBITRATOR_SUCCEEDED:
      return {
        ...state,
        isFallbackArbitrator: action.isFallbackArbitrator
      };
    case GET_ARBITRATORS_SUCCEEDED:
      return {
        ...state,
        arbitrators: action.arbitrators
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
    case CHANGE_ACCEPT_EVERYONE_SUCCEEDED:
      return {
        ...state,
        loading: false,
        error: '',
        errorGet: '',
        acceptAny: action.acceptAny
      };
    case REQUEST_ARBITRATOR_SUCCEEDED:
      {
        const arbitrators = {...state.arbitrators};
        arbitrators[action.arbitrator].request.status = AWAIT;
        return {
          ...state,
          arbitrators,
          loading: false,
          error: ''
        };
      }
    case CANCEL_ARBITRATOR_REQUEST_SUCCEEDED:
      {
        const arbitrators = {...state.arbitrators};
        arbitrators[action.arbitrator].request.status = CLOSED;
        return {
          ...state,
          arbitrators,
          loading: false,
          error: ''
        };
      }
    case CANCEL_ARBITRATOR_SELECTION_ACTIONS:
    case BUY_LICENSE_CANCEL:
      return {
        ...state,
        loading: false,
        error: '',
        errorGet: ''
      };
    case LOAD_PRICE_SUCCEEDED:
      return {
        ...state,
        price: fromTokenDecimals(action.price, 18)
      };
    case CHECK_LICENSE_OWNER_SUCCEEDED:
      return {
        ...state,
        licenseOwner: action.isLicenseOwner,
        acceptAny: action.acceptAny
      };
    case BUY_LICENSE_FAILED:
    case CHECK_LICENSE_OWNER_FAILED:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    case GET_ARBITRATION_REQUESTS_SUCCEEDED:
      return {
        ...state,
        arbitratorRequests: action.requests
      };
    case GET_BLACKLISTED_SELLERS_SUCCEEDED:
      return {
        ...state,
        blacklistedSellers: action.sellers
      };
    case BLACKLIST_SELLER_SUCCEEDED:
      return {
        ...state,
        blacklistedSellers: [
          ...state.blacklistedSellers,
          action.sellerAddress
        ]
      };
    case UNBLACKLIST_SELLER_SUCCEEDED: {
      const blacklistedSellers = [...state.blacklistedSellers];
      const index = blacklistedSellers.indexOf(action.sellerAddress);
      if (index === -1) {
        return state;
      }
      blacklistedSellers.splice(index, 1);
      return {
        ...state,
        blacklistedSellers: blacklistedSellers
      };
    }
    case REJECT_ARBITRATOR_REQUEST_SUCCEEDED:
      {
        const arbitratorRequests = [...state.arbitratorRequests];
        arbitratorRequests.find(x => x.id === action.id).status = REJECTED;
        return {
          ...state,
          arbitratorRequests,
          loading: false
        };

      }
    case ACCEPT_ARBITRATOR_REQUEST_SUCCEEDED:
      {
        const arbitratorRequests = [...state.arbitratorRequests];
        arbitratorRequests.find(x => x.id === action.id).status = ACCEPTED;
        return {
          ...state,
          arbitratorRequests,
          loading: false
        };

      }
    case RESET_ARBITRATOR_SCORES: {
      return {
        ...state,
        arbitratorScores: {}
      };
    }
    case ADD_ARBITRATOR_SCORE: {
      const arbitrator = toChecksumAddress(action.arbitrator);
      return {
        ...state,
        arbitratorScores: {
          ...state.arbitratorScores,
          [arbitrator]: (state.arbitratorScores[arbitrator] || 0) + 1
        }
      };
    }
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
