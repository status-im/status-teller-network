import {
  LOAD_OFFERS_SUCCEEDED, LOAD_USER_SUCCEEDED,
  ADD_OFFER, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED, RESET_ADD_OFFER_STATUS, ADD_OFFER_PRE_SUCCESS,
  UPDATE_USER, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED, RESET_UPDATE_USER_STATUS,
  LOAD_USER_LOCATION_SUCCEEDED, SET_CURRENT_USER, LOAD_USER_TRADE_NUMBER_SUCCEEDED,
  SIGN_MESSAGE, SIGN_MESSAGE_SUCCEEDED, SIGN_MESSAGE_FAILED
} from './constants';
import {USER_RATING_SUCCEEDED, CREATE_ESCROW_SUCCEEDED} from '../escrow/constants';
import { States } from '../../utils/transaction';
import {RESET_STATE, PURGE_STATE} from "../network/constants";
import {toChecksumAddress} from '../../utils/address';

const DEFAULT_STATE = {
  addOfferStatus: States.none,
  addOfferTx: '',
  updateUserStatus: States.none,
  users: {},
  offers: {},
  signing: false,
  signature: ''
};

function formatOffer(offer) {
  return {
    ...offer,
    id: parseInt(offer.id, 10),
    paymentMethods: offer.paymentMethods.map((i) => parseInt(i, 10)),
    owner: toChecksumAddress(offer.owner),
    asset: toChecksumAddress(offer.asset)
  };
}

/*eslint-disable-next-line complexity */
function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case RESET_ADD_OFFER_STATUS:
      return {
        ...state,
        addOfferStatus: States.none,
        addOfferTx: ''
      };
    case ADD_OFFER:
      return {
        ...state,
        addOfferStatus: States.pending,
        addOfferTx: ''
      };
    case ADD_OFFER_PRE_SUCCESS:
      return {
        ...state,
        addOfferTx: action.txHash
      };
    case ADD_OFFER_SUCCEEDED: {
      return {
        ...state,
        addOfferStatus: States.success,
        users: {...state.users, [toChecksumAddress(action.receipt.from)]: action.user}
      };
    }
    case ADD_OFFER_FAILED:
      return {
        ...state, addOfferStatus: States.failed
      };
    case RESET_UPDATE_USER_STATUS:
      return {
        ...state, updateUserStatus: States.none
      };
    case UPDATE_USER:
      return {
        ...state, updateUserStatus: States.pending
      };
    case SET_CURRENT_USER:
      return {
        ...state, currentUser: action.currentUser
      };
    case UPDATE_USER_SUCCEEDED: {
      return {
        ...state,
        updateUserStatus: States.success,
        users: {...state.users, [toChecksumAddress(action.receipt.from)]: {
          ...state.users[toChecksumAddress(action.receipt.from)],
          ...action.user
        }}
      };
    }
    case UPDATE_USER_FAILED:
      return {
        ...state, updateUserStatus: States.failed
      };
    case LOAD_USER_SUCCEEDED:
      return {
        ...state, users: {...state.users, [toChecksumAddress(action.address)]: {
          ...state.users[toChecksumAddress(action.address)],
          ...action.user
        }}
      };
    case LOAD_USER_TRADE_NUMBER_SUCCEEDED:
      return {
        ...state, users: {
          ...state.users,
          [toChecksumAddress(action.address)]: {
            ...state.users[toChecksumAddress(action.address)],
            nbReleasedTrades: action.nbReleasedTrades,
            nbCreatedTrades: action.nbCreatedTrades
          }
        }
      };
    case LOAD_USER_LOCATION_SUCCEEDED:
      return {
        ...state, users: {...state.users, [toChecksumAddress(action.address)]: {
            ...state.users[toChecksumAddress(action.address)],
            coords: action.coords
          }
        }
      };
    case LOAD_OFFERS_SUCCEEDED: {
      const newOffers = action.offers.reduce((offers, offer) => {
        offers[offer.id] = formatOffer(offer);
        return offers;
      }, state.offers);

      return {
        ...state, offers: newOffers
      };
    }
    case USER_RATING_SUCCEEDED:
      return  {
        ...state, users: {...state.users, [toChecksumAddress(action.address)]: {
            ...state.users[toChecksumAddress(action.address)],
            downCount: action.downCount,
            upCount: action.upCount,
            voteCount: action.voteCount
          }
        }
      };
    case RESET_STATE: {
      return Object.assign({}, state, {
        addOfferStatus: States.none,
        updateUserStatus: States.none
      });
    }
    case CREATE_ESCROW_SUCCEEDED: {
      return {
        ...state,
      users: {
          ...state.users,
          [toChecksumAddress(action.user.buyerAddress)]: {
            ...state.users[toChecksumAddress(action.user.buyerAddress)],
            statusContactCode: action.user.statusContactCode,
            username: action.user.username
          }
        }
      };
    }
    case PURGE_STATE:
      return DEFAULT_STATE;
    case SIGN_MESSAGE:
      return {
        ...state,
        signing: true
      };
    case SIGN_MESSAGE_SUCCEEDED: 
      return {
        ...state,
        signing: false,
        signature: action.signature,
        nonce: action.nonce
      };
    case SIGN_MESSAGE_FAILED: 
      return {
        ...state,
        signing: false,
        signature: "",
        nonce: 0
      };
    default:
      return state;
  }
}

export default reducer;
