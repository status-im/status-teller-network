import {
  SET_CURENCY,
  SET_MARGIN,
  SET_ASSET,
  SET_LOCATION,
  SET_PAYMENT_METHODS,
  SET_CONTACT_INFO,
  SET_ARBITRATOR,
  SET_LIMITS
} from './constants';
import {RESET_STATE, PURGE_STATE} from "../network/constants";
import {ADD_OFFER_SUCCEEDED,RESET_NEW_OFFER} from '../metadata/constants';
import {getContactData} from "../../utils/strings";


const DEFAULT_STATE = {
  asset: '',
  contactData: '',
  location: '',
  currency: '',
  username: '',
  arbitrator: '',
  paymentMethods: [],
  useCustomLimits: true,
  limitL: '',
  limitU: '',
  margin: 0
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_CURENCY:
      return {
        ...state,
        currency: action.currency
      };
    case SET_ASSET:
      return {
        ...state,
        asset: action.asset
      };
    case SET_ARBITRATOR:
      return {
        ...state,
        arbitrator: action.arbitrator
      };
    case SET_LOCATION:
      return {
        ...state,
        location: action.location
      };
    case SET_PAYMENT_METHODS:
      return {
        ...state,
        paymentMethods: action.paymentMethods
      };
    case SET_MARGIN:
      return {
        ...state,
        margin: action.margin
      };
    case SET_CONTACT_INFO:
      return {
        ...state,
        username: action.username,
        contactData: action.contactMethod && action.contactUsername ? getContactData(action.contactMethod, action.contactUsername) : ''
      };
    case SET_LIMITS: 
      return {
        ...state,
        useCustomLimits: action.useCustomLimits,
        limitL: action.limitL,
        limitU: action.limitU
      };
    case ADD_OFFER_SUCCEEDED:
    case RESET_NEW_OFFER:
    case PURGE_STATE:
    case RESET_STATE: {
      return DEFAULT_STATE;
    }
    default:
      return state;
  }
}

export default reducer;
