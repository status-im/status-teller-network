import {
  LOAD_OFFERS_SUCCEEDED, LOAD_USER_SUCCEEDED,
  ADD_OFFER, ADD_OFFER_SUCCEEDED, ADD_OFFER_FAILED, RESET_ADD_OFFER_STATUS, ADD_OFFER_PRE_SUCCESS,
  UPDATE_USER, UPDATE_USER_SUCCEEDED, UPDATE_USER_FAILED, RESET_UPDATE_USER_STATUS,
  LOAD_USER_LOCATION_SUCCEEDED, SET_CURRENT_USER, LOAD_USER_TRADE_NUMBER_SUCCEEDED,
  DELETE_OFFER_SUCCEEDED, RESET_NEW_OFFER,
  DELETE_OFFER, DELETE_OFFER_PRE_SUCCESS, DELETE_OFFER_FAILED,
  ENABLE_ETHEREUM_FAILED, ENABLE_ETHEREUM_SUCCEEDED,  SET_MAINNET_WARNING_SHOWED,
  RESET_PROVIDER_VERIFICATION,
  GET_OFFER_PRICE,
  GET_OFFER_PRICE_SUCCEEDED
} from './constants';
import {USER_RATING_SUCCEEDED, CREATE_ESCROW_SUCCEEDED, RATE_TRANSACTION_SUCCEEDED} from '../escrow/constants';
import {BUY_LICENSE_SUCCEEDED} from '../license/constants';
import {RESET_NEW_BUY} from '../newBuy/constants';
import { States } from '../../utils/transaction';
import {RESET_STATE, PURGE_STATE} from "../network/constants";
import {toChecksumAddress} from '../../utils/address';

const DEFAULT_STATE = {
  defaultProvider: false,
  eip1102Enabled: false,
  mainnetWarningShowed: false,
  addOfferStatus: States.none,
  addOfferTx: '',
  updateUserStatus: States.none,
  users: {},
  offers: {},
  deleteOfferStatus: States.none,
  offerPrice: ''
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
    case RESET_NEW_OFFER:
    case RESET_ADD_OFFER_STATUS:
      return {
        ...state,
        addOfferStatus: States.none,
        addOfferTx: ''
      };
    case ENABLE_ETHEREUM_SUCCEEDED:
      return {
        ...state,
        eip1102Enabled: true,
       defaultProvider: action.accounts === undefined || !action.accounts.length
      };
    case ENABLE_ETHEREUM_FAILED:
      return {
        ...state,
        eip1102Enabled: false,
        defaultProvider: false
      };
    case RESET_PROVIDER_VERIFICATION:
      return {
        ...state,
        defaultProvider: false
      };
    case SET_MAINNET_WARNING_SHOWED:
      return {
        ...state,
        mainnetWarningShowed: true
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
      const _from = toChecksumAddress(action.receipt.from);
      return {
        ...state,
        addOfferStatus: States.success,
        offers: {
          ...state.offers,
          [action.receipt.events.OfferAdded.returnValues.offerId]: {
            ...formatOffer(action.offer),
            owner: _from,
            id: action.receipt.events.OfferAdded.returnValues.offerId
          }
        },
        users: {
          ...state.users,
          [_from]: {
            ...state.users[_from],
            ...action.user
          }
        }
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
        users: {
          ...state.users,
          [toChecksumAddress(action.receipt.from)]: {
            ...state.users[toChecksumAddress(action.receipt.from)],
            ...action.user
          }
        }
      };
    }
    case UPDATE_USER_FAILED:
      return {
        ...state, updateUserStatus: States.failed
      };
    case LOAD_USER_SUCCEEDED:
      // console.log('LOADED USER', action.address, action.user);
      return {
        ...state, users: {
          ...state.users, [toChecksumAddress(action.address)]: {
            ...state.users[toChecksumAddress(action.address)],
            ...action.user
          }
        }
      };
    case BUY_LICENSE_SUCCEEDED:
      return {
        ...state, users: {
          ...state.users,
          [toChecksumAddress(state.currentUser)]: {
            ...state.users[toChecksumAddress(state.currentUser)],
            isSeller: true
          }
        }
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
        ...state, users: {
          ...state.users,
          [toChecksumAddress(action.address)]: {
            ...state.users[toChecksumAddress(action.address)],
            coords: action.coords,
            countryCode: action.countryCode
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
      return {
        ...state, users: {
          ...state.users,
          [toChecksumAddress(action.address)]: {
            ...state.users[toChecksumAddress(action.address)],
            downCount: action.downCount,
            upCount: action.upCount,
            voteCount: action.voteCount,
            averageCount: action.averageCount,
            averageCountBase10: action.averageCountBase10
          }
        }
      };
    case RATE_TRANSACTION_SUCCEEDED: {
      const user = Object.assign({}, state.users[action.user]);
      user.voteCount++;
      if (action.rating > 3) {
        user.upCount++;
      } else if (action.rating < 3) {
        user.downCount++;
      }

      // Calculate new average from the percentage of votes the original average had vs the new vote
      if (isNaN(user.averageCount)) {
        user.averageCount = action.rating;
      } else {
        user.averageCount = (user.averageCount * ((user.voteCount - 1) / user.voteCount)) + (parseInt(action.rating, 10) / user.voteCount);
      }

      user.averageCountBase10 = ((user.averageCount * 10) / 5);

      return {
        ...state, users: {
          ...state.users,
          [toChecksumAddress(action.user)]: user
        }
      };
    }
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
    case RESET_NEW_BUY:
      return {
        ...state
      };
    case DELETE_OFFER:
      return {
        ...state,
        deleteOfferStatus: States.pending,
        txHash: ''
      };
    case DELETE_OFFER_PRE_SUCCESS:
      return {
        ...state,
        txHash: action.txHash
      };
    case DELETE_OFFER_SUCCEEDED: {
      const newOffers = {...state.offers};
      delete newOffers[action.offerId];
      return {
        ...state,
        deleteOfferStatus: States.none,
        txHash: '',
        offers: newOffers
      };
    }
    case DELETE_OFFER_FAILED:
      return {
        ...state, deleteOfferStatus: States.failed
      };
    case GET_OFFER_PRICE:
      return {
        ...state, offerPrice: null
      };
    case GET_OFFER_PRICE_SUCCEEDED:
      return {
        ...state, offerPrice: action.price
      };
    default:
      return state;
  }
}

export default reducer;
